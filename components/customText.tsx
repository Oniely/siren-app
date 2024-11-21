// src/components/CustomText.tsx
import React from 'react';
import { Text, TextProps } from 'react-native';

const CustomTextBold = ({ style, ...props }: TextProps) => {
  return <Text {...props} style={[{ fontFamily: 'BeVietnamProBold' }, style]} />;
};

const CustomTextThin = ({ style, ...props }: TextProps) => {
    return <Text {...props} style={[{ fontFamily: 'BeVietnamProThin' }, style]} />;
  };
  

  const CustomTextRegular = ({ style, ...props }: TextProps) => {
    return <Text {...props} style={[{ fontFamily: 'BeVietnamProRegular' }, style]} />;
  };
  
export default CustomTextBold; CustomTextThin; CustomTextRegular;
