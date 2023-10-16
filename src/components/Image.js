import React from 'react';
import useDarkMode from 'use-dark-mode';

function Image({
  className, src, srcDark, srcSet, srcSetDark, alt,
}) {
  const darkMode = useDarkMode(false);

  return (
    <img
      className={className}
      srcSet={darkMode.value ? srcSetDark : srcSet}
      src={darkMode.value ? srcDark : src}
      alt={alt}
    />
  );
}

export default Image;
