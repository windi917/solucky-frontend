import React, { useState } from 'react';

// Function to darken a color
const darkenColor = (hex: string, percent: number): string => {
  const factor = 1 - percent / 100;
  const [r, g, b] = hex.match(/\w\w/g)?.map(c => parseInt(c, 16)) || [0, 0, 0];
  const darkerR = Math.floor(r * factor);
  const darkerG = Math.floor(g * factor);
  const darkerB = Math.floor(b * factor);
  return `#${darkerR.toString(16).padStart(2, '0')}${darkerG.toString(16).padStart(2, '0')}${darkerB.toString(16).padStart(2, '0')}`;
};

// Function to lighten a color
const lightenColor = (hex: string, percent: number): string => {
  const factor = percent / 100;
  const [r, g, b] = hex.match(/\w\w/g)?.map(c => parseInt(c, 16)) || [0, 0, 0];
  const lighterR = Math.min(Math.floor(r + 255 * factor), 255);
  const lighterG = Math.min(Math.floor(g + 255 * factor), 255);
  const lighterB = Math.min(Math.floor(b + 255 * factor), 255);
  return `#${lighterR.toString(16).padStart(2, '0')}${lighterG.toString(16).padStart(2, '0')}${lighterB.toString(16).padStart(2, '0')}`;
};

type ButtonProps = {
  click?: () => void;
  b_name: string;
  color: string;
  width: string | number;
  height: string | number;
  t_color?: string;
  border?: string;
};

export default function S_Button({
  click,
  b_name,
  color,
  width,
  height,
  t_color = "#1A2828",
  border = "none",
}: ButtonProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isClicked, setIsClicked] = useState(false);

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  const handleClick = () => {
    setIsClicked(!isClicked);
    click(); // Trigger the click handler passed from props
  };

  const darkColor = darkenColor(color, 20); // Darken by 20%

  const style = {
    backgroundColor: (isHovered ? darkColor : color),
    width: width,
    height: height,
    color: t_color,
    border: border,
  };

  return (
    <div
      onClick={handleClick}
      className='button-raffle' style={style}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {b_name}
    </div>
  );
}