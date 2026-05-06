/**
 * BeverageSelector — Horizontal scrollable beverage type picker.
 * Animated selection highlight with glow effect.
 */
import React from 'react'
import { View, ScrollView, Pressable, StyleSheet } from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated'
import { Text } from '@/components/ui/Text'
import {
  ACCENT, ACCENT_DIM, ACCENT_BORDER, SURFACE2, BORDER,
  BEV_WATER, BEV_COFFEE, BEV_TEA, BEV_JUICE, BEV_SPORTS, BEV_MILK,
} from '@/lib/theme'
import {
  BEVERAGE_ICONS, BEVERAGE_LABELS, BEVERAGE_MULTIPLIERS,
  type BeverageType,
} from '@/lib/hydrationEngine'
import * as Haptics from 'expo-haptics'
import { Platform } from 'react-native'

const BEVERAGE_COLORS: Record<BeverageType, string> = {
  water:  BEV_WATER,
  coffee: BEV_COFFEE,
  tea:    BEV_TEA,
  juice:  BEV_JUICE,
  sports: BEV_SPORTS,
  milk:   BEV_MILK,
}

const BEVERAGES: BeverageType[] = ['water', 'coffee', 'tea', 'juice', 'sports', 'milk']

interface Props {
  selected: BeverageType
  onSelect: (type: BeverageType) => void
}

function BeverageChip({
  type,
  selected,
  onSelect,
}: { type: BeverageType; selected: boolean; onSelect: (t: BeverageType) => void }) {
  const scale = useSharedValue(1)
  const color = BEVERAGE_COLORS[type]
  const mult  = BEVERAGE_MULTIPLIERS[type]

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }))

  function handlePress() {
    if (Platform.OS !== 'web') {
      Haptics.selectionAsync()
    }
    scale.value = withSpring(0.9, { damping: 12 }, () => {
      scale.value = withSpring(1, { damping: 10 })
    })
    onSelect(type)
  }

  return (
    <Animated.View style={animStyle}>
      <Pressable onPress={handlePress}>
        <View
          style={[
            styles.chip,
            selected && { borderColor: color, backgroundColor: `${color}18` },
          ]}
        >
          <Text style={styles.icon}>{BEVERAGE_ICONS[type]}</Text>
          <Text style={[styles.label, selected && { color: '#fff' }]}>
            {BEVERAGE_LABELS[type]}
          </Text>
          {mult < 1 ? (
            <View style={[styles.multBadge, { backgroundColor: `${color}28` }]}>
              <Text style={[styles.multText, { color }]}>×{mult}</Text>
            </View>
          ) : null}
        </View>
      </Pressable>
    </Animated.View>
  )
}

export default function BeverageSelector({ selected, onSelect }: Props) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
    >
      {BEVERAGES.map(type => (
        <BeverageChip
          key={type}
          type={type}
          selected={selected === type}
          onSelect={onSelect}
        />
      ))}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 20,
    paddingVertical: 4,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 50,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.10)',
    backgroundColor: SURFACE2,
  },
  icon: {
    fontSize: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.60)',
  },
  multBadge: {
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 8,
  },
  multText: {
    fontSize: 10,
    fontWeight: '700',
  },
})
