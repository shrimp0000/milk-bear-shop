// This file is a fallback for using MaterialIcons on Android and web.

import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { SymbolWeight } from 'expo-symbols';
import React from 'react';
import { OpaqueColorValue, StyleProp, ViewStyle } from 'react-native';
import Entypo from '@expo/vector-icons/Entypo';

// Add your SFSymbol to MaterialIcons mappings here.
const MAPPING = {
  // See MaterialIcons here: https://icons.expo.fyi
  // See SF Symbols in the SF Symbols app on Mac.
  'house.fill': 'home',
  'paperplane.fill': 'send',
  'chevron.left.forwardslash.chevron.right': 'code',
  'chevron.right': 'chevron-right',
  'plus.app.fill': 'add',
  'storefront.fill': 'store',
  'cart.fill': 'shopping-cart',
  'trash.circle.fill': 'delete',
  'list.bullet.clipboard.fill': 'list',
  'pencil': 'edit',
  'info.circle': 'info',
  'person.2.fill': 'people',
  'square.and.pencil.circle.fill': 'edit',
  'minus.circle.fill': 'remove',
} as Partial<
  Record<
    import('expo-symbols').SymbolViewProps['name'],
    React.ComponentProps<typeof MaterialIcons>['name']
  >
>;

export type IconSymbolName = keyof typeof MAPPING;

/**
 * An icon component that uses native SFSymbols on iOS, and MaterialIcons on Android and web. This ensures a consistent look across platforms, and optimal resource usage.
 *
 * Icon `name`s are based on SFSymbols and require manual mapping to MaterialIcons.
 */
export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<ViewStyle>;
  weight?: SymbolWeight;
}) {
  if (name === 'minus.circle.fill') {
    return <Entypo name="circle-with-minus" size={20} color="black" />;
  }
  return <MaterialIcons color={color} size={size} name={MAPPING[name]} style={style} />;
}
