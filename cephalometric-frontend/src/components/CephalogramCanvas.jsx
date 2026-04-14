import React, { useEffect, useState } from 'react';
import { Stage, Layer, Image, Circle, Text, Line, Group } from 'react-konva';
import useImage from 'use-image';

const CephalogramCanvas = ({ imageSrc, landmarks }) => {
  const [image] = useImage(imageSrc || 'https://via.placeholder.com/800x600.png?text=Cephalogram+X-Ray');
  
  // Container dimensions
  const containerWidth = 800;
  const containerHeight = 600;

  // Calculate scale to fit image inside container while maintaining aspect ratio
  const scale = image ? Math.min(containerWidth / image.width, containerHeight / image.height) : 1;
  const imgWidth = image ? image.width * scale : containerWidth;
  const imgHeight = image ? image.height * scale : containerHeight;

  // We optionally center the image
  const xOffset = (containerWidth - imgWidth) / 2;
  const yOffset = (containerHeight - imgHeight) / 2;

  // Helper to draw lines between named points
  const getLineCoordinates = (pointNames) => {
    const coords = [];
    pointNames.forEach(name => {
      const pt = landmarks.find(l => l.name === name);
      if (pt) {
        // Adjust for scale and offset
        coords.push(pt.x * scale + xOffset, pt.y * scale + yOffset);
      }
    });
    return coords;
  };

  // Common Orthodontic Planes (Sella-Nasion, Nasion-Point A, etc)
  const planes = [
    { name: 'S-N Plane', points: ['Sella', 'Nasion'], color: '#a855f7' }, // purple-500
    { name: 'N-A Plane', points: ['Nasion', 'Point A'], color: '#22c55e' }, // green-500
    { name: 'N-B Plane', points: ['Nasion', 'Point B'], color: '#22c55e' },
    { name: 'Mandibular Plane', points: ['Gonion', 'Menton'], color: '#a855f7' },
    { name: 'Palatal Plane', points: ['ANS', 'PNS'], color: '#3b82f6' }     // blue-500
  ];

  return (
    <div className="bg-gray-100 rounded-lg shadow-inner overflow-hidden border border-gray-200 flex justify-center items-center h-full w-full">
      <Stage width={containerWidth} height={containerHeight}>
        <Layer>
          {/* Base X-Ray Image */}
          {image && (
            <Image
              image={image}
              width={imgWidth}
              height={imgHeight}
              x={xOffset}
              y={yOffset}
              opacity={0.8}
            />
          )}

          {/* Planes / Connecting Lines */}
          {landmarks && landmarks.length > 0 && planes.map((plane, i) => (
            <Line
              key={`line-${i}`}
              points={getLineCoordinates(plane.points)}
              stroke={plane.color}
              strokeWidth={2}
              dash={[5, 5]}
            />
          ))}

          {/* Landmark Points */}
          {landmarks?.map((point) => {
            const scaledX = point.x * scale + xOffset;
            const scaledY = point.y * scale + yOffset;
            return (
              <Group key={point.id}>
                <Circle
                  x={scaledX}
                  y={scaledY}
                  radius={4}
                  fill="#10b981" // emerald-500
                  stroke="#ffffff"
                  strokeWidth={1}
                />
                {/* Optional logic to only show text for main points to avoid clutter */}
                {['Sella', 'Nasion', 'Point A', 'Point B', 'Gonion', 'Menton'].includes(point.name) && (
                  <Text
                    x={scaledX + 8}
                    y={scaledY - 8}
                    text={point.name}
                    fontSize={12}
                    fontFamily="Inter, sans-serif"
                    fill="#1e293b" // slate-800
                    shadowColor="white"
                    shadowBlur={2}
                    shadowOffset={{ x: 1, y: 1 }}
                    shadowOpacity={1}
                  />
                )}
              </Group>
            );
          })}
        </Layer>
      </Stage>
    </div>
  );
};

export default CephalogramCanvas;
