from utils import encode_cephalometric_landmarks, decode_cephalometric_landmarks, craniofacial_landmark_regions, rescale_input, save_statistics
from network.model import Network
from data import Dataset
from paths import Paths
import tensorflow as tf
from config import cfg

def train_step(
    data: list,
    network: Network,
    optimizer: tf.keras.optimizers.Optimizer,
):
    images, landmarks = data
    image_height, image_width = images.shape[1:-1]
    with tf.GradientTape(persistent=False) as tape:
        true_landmarks = encode_cephalometric_landmarks(landmarks, image_height, image_width)
        pred_landmarks = network.landmark_detection_module(inputs=images, training=True)
        pred_landmarks = tf.stack([pred_landmarks[:, 0::2], pred_landmarks[:, 1::2]], axis=-1)

        ldn_true_landmarks = decode_cephalometric_landmarks(true_landmarks, height=cfg.ORIGINAL_HEIGHT, width=cfg.ORIGINAL_WIDTH)
        ldn_pred_landmarks = decode_cephalometric_landmarks(pred_landmarks, height=cfg.ORIGINAL_HEIGHT, width=cfg.ORIGINAL_WIDTH)

        detection_loss = tf.reduce_mean(tf.keras.losses.mean_squared_error(true_landmarks, pred_landmarks), axis=-1)
        detection_error = tf.reduce_mean(
            tf.sqrt(
                tf.add(
                    tf.square(ldn_true_landmarks[:, :, 0] - ldn_pred_landmarks[:, :, 0]),
                    tf.square(ldn_true_landmarks[:, :, 1] - ldn_pred_landmarks[:, :, 1])
                )
            ),
            axis=0
        )

        block3_proposals = craniofacial_landmark_regions(pred_landmarks, height=(image_height / 8),  width=(image_width / 4),  size=7)
        block4_proposals = craniofacial_landmark_regions(pred_landmarks, height=(image_height / 16), width=(image_width / 8),  size=5)
        block5_proposals = craniofacial_landmark_regions(pred_landmarks, height=(image_height / 32), width=(image_width / 16), size=3)
        proposals = tf.stack([block3_proposals, block4_proposals, block5_proposals])

        true_locations = []
        pred_locations = []
        for index in range(cfg.NUM_LANDMARKS):
            candidate_regions = proposals[:, :, index, :]
            actual_locations = true_landmarks[:, index, :]
            refine_locations = network.landmark_refinement_module.heads[index](inputs=[images, candidate_regions], training=True) + pred_landmarks[:, index, :]
            true_locations.append(actual_locations)
            pred_locations.append(refine_locations)

        true_locations = tf.stack(true_locations, axis=1)
        pred_locations = tf.stack(pred_locations, axis=1)

        lrn_true_landmarks = decode_cephalometric_landmarks(true_locations, height=cfg.ORIGINAL_HEIGHT, width=cfg.ORIGINAL_WIDTH)
        lrn_pred_landmarks = decode_cephalometric_landmarks(pred_locations, height=cfg.ORIGINAL_HEIGHT, width=cfg.ORIGINAL_WIDTH)

        refinement_loss = tf.reduce_mean(tf.keras.losses.mean_squared_error(true_locations, pred_locations), axis=0)
        refinement_error = tf.reduce_mean(
            tf.sqrt(
                tf.add(
                    tf.square(lrn_true_landmarks[:, :, 0] - lrn_pred_landmarks[:, :, 0]),
                    tf.square(lrn_true_landmarks[:, :, 1] - lrn_pred_landmarks[:, :, 1])
                )
            ),
            axis=0
        )

        multi_head_loss = tf.concat([detection_loss, refinement_loss], axis=0)

    gradients = tape.gradient(multi_head_loss, network.model.trainable_variables)
    optimizer.apply_gradients(zip(gradients, network.model.trainable_variables))

    return (detection_loss, detection_error), (tf.reduce_mean(refinement_loss[tf.newaxis, :], axis=-1), refinement_error)

def train_on_batch(
    data: Dataset,
    network: Network,
    optimizer: tf.keras.optimizers.Optimizer,
    max_images: int = 0
):
    stats = []
    for index in range(len(data)):
        images, landmarks = data[index]
        images = rescale_input(images, scale=(1 / 255), offset=0)

        ldn_stats, lrn_stats = train_step(
            data=[
                images,
                landmarks
            ],
            network=network,
            optimizer=optimizer
        )

        stats.append(
            tf.concat([
                ldn_stats[0],
                ldn_stats[1],
                tf.reduce_mean(ldn_stats[1][tf.newaxis, :], axis=1),
                lrn_stats[0],
                lrn_stats[1],
                tf.reduce_mean(lrn_stats[1][tf.newaxis, :], axis=1)
            ],
            axis=0)
        )

        results = tf.reduce_mean(tf.stack(stats), axis=0)
        print("\r[Image {}/{}] loss: {:.5f} - landmark-detection-error: {:.3f} - landmark-refinment-error: {:.3f}".format(index + 1, len(data), results[0], results[cfg.NUM_LANDMARKS+1], results[2*cfg.NUM_LANDMARKS+2]), end="", flush=True)

        if max_images > 0 and (index + 1) >= max_images:
            print(f"\n[INFO] Berhenti otomatis setelah {max_images} gambar (Mode Simulasi aktif).")
            break

    return stats

def train(
    data: Dataset,
    network: Network,
    optimizer: tf.keras.optimizers.Optimizer,
    epochs: int = cfg.TRAIN.EPOCHS,
    max_images: int = 0
):
    for epoch in range(1, epochs + 1):
        num_digits = len(str(epochs))
        fmt = "{:" + str(num_digits) + "d}"
        print("\nEpoch: " + fmt.format(epoch) + "/" + fmt.format(epochs) + "")

        stats = train_on_batch(
            data,
            network,
            optimizer=optimizer,
            max_images=max_images
        )
        results = tf.reduce_mean(tf.stack(stats), axis=0)
        print("\ntrain_loss: {:.5f} - landmark-detection-error: {:.3f} - landmark-refinment-error: {:.3f}".format(results[0], results[cfg.NUM_LANDMARKS + 1], results[2*cfg.NUM_LANDMARKS+2]), end="")
        save_statistics(results.numpy(), Paths.logs_root_path, mode="train")
        
        # [Penambahan]: Menyimpan "Pikiran/Bobot AI" di setiap akhir iterasi Epoch ke harddisk lokal
        weights_file = f"./models/cephmark_final_weights_epoch{epoch}.h5"
        network.model.save_weights(weights_file)
        print(f"\n[SAVE] Berhasil menyimpan paramater AI ke: {weights_file}")


if __name__ == "__main__":
    import argparse
    from network.model import Network
    from data import Dataset
    from config import cfg

    parser = argparse.ArgumentParser(description="CEPHMark-Net Training")
    parser.add_argument("--dataset", type=str, default="aariz", choices=["isbi", "aariz", "pku"], help="Dataset to train on")
    parser.add_argument("--max-images", type=int, default=0, help="Set angka untuk melimitasi training ke X gambar")
    args = parser.parse_args()

    train_data = Dataset(name=args.dataset, mode="train", batch_size=1, shuffle=False)

    network = Network(
        backbone_name="resnet50",
        freeze_backbone=False,
        backbone_weights=None
    )

    train(
        train_data,
        network,
        optimizer=cfg.TRAIN.OPTIMIZER,
        epochs=2,
        max_images=args.max_images
    )