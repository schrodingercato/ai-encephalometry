export const generateDummyLandmarks = () => {
  // 29 points mimicking cephalometric landmarks on 800x600 image
  const points = [
    { id: 1, name: 'Sella', x: 400, y: 300 },
    { id: 2, name: 'Nasion', x: 600, y: 250 },
    { id: 3, name: 'Point A', x: 550, y: 400 },
    { id: 4, name: 'Point B', x: 530, y: 460 },
    { id: 5, name: 'Pogonion', x: 540, y: 490 },
    { id: 6, name: 'Gnathion', x: 520, y: 510 },
    { id: 7, name: 'Menton', x: 500, y: 520 },
    { id: 8, name: 'Gonion', x: 350, y: 450 },
    { id: 9, name: 'ANS', x: 570, y: 370 },
    { id: 10, name: 'PNS', x: 420, y: 380 },
    // more fillers to reach 29 for visual representation
    ...Array.from({ length: 19 }, (_, i) => ({
      id: 11 + i,
      name: `Pt ${11 + i}`,
      x: 350 + Math.random() * 250,
      y: 200 + Math.random() * 320
    }))
  ];
  return points;
};

export const DUMMY_ANGLES = [
  { name: 'SNA', value: 79, normal: '82° ± 2°', status: 'Normal' },
  { name: 'SNB', value: 77, normal: '80° ± 2°', status: 'Normal' },
  { name: 'ANB', value: 2, normal: '2° ± 2°', status: 'Normal' },
  { name: 'Gonial Angle', value: 136, normal: '130° ± 7°', status: 'Normal' },
  { name: 'Mandibular Plane', value: 112, normal: '110° ± 5°', status: 'Normal' }
];

export const callAPI = async (imageFile) => {
  // Simulate API Call delay
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        landmarks: generateDummyLandmarks(),
        measurements: DUMMY_ANGLES
      });
    }, 2000);
  });
};
