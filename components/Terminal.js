import { View, Text, TouchableOpacity, TextInput, StyleSheet } from 'react-native';
import { COLORS, ICONS } from '../lib/constants';

export function TBox({ children, style }) {
  return (
    <View style={[tstyles.box, style]}>
      {children}
    </View>
  );
}

export function THeader({ title, subtitle, style }) {
  return (
    <View style={[tstyles.header, style]}>
      <Text style={tstyles.prompt}>❯</Text>
      <View style={{ flex: 1, marginLeft: 10 }}>
        <Text style={tstyles.title}>{title}</Text>
        {subtitle && <Text style={tstyles.subtitle}>{subtitle}</Text>}
      </View>
    </View>
  );
}

export function TBtn({ title, onPress, variant = 'primary', style, disabled }) {
  const isPrimary = variant === 'primary';
  const isDanger = variant === 'danger';
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      style={[
        tstyles.btn,
        {
          borderColor: isDanger ? COLORS.error : COLORS.border,
          opacity: disabled ? 0.4 : 1,
        },
        style,
      ]}
    >
      <Text style={[tstyles.btnText, { color: isDanger ? COLORS.error : COLORS.primary }]}>
        {isPrimary ? '[ OK ]' : isDanger ? '[ !! ]' : '[ .. ]'} {title}
      </Text>
    </TouchableOpacity>
  );
}

export function TInput({ value, onChangeText, placeholder, multiline, style }) {
  return (
    <TextInput
      style={[tstyles.input, multiline && { minHeight: 100, textAlignVertical: 'top' }, style]}
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor={COLORS.textMuted}
      autoCapitalize="none"
      autoCorrect={false}
      multiline={multiline}
    />
  );
}

export function TBadge({ label, color = COLORS.primary }) {
  return (
    <View style={[tstyles.badge, { borderColor: color }]}>
      <Text style={[tstyles.badgeText, { color }]}>{label}</Text>
    </View>
  );
}

export function TStat({ value, label }) {
  return (
    <View style={tstyles.stat}>
      <Text style={tstyles.statValue}>{value}</Text>
      <Text style={tstyles.statLabel}>{label}</Text>
    </View>
  );
}

export function TDivider() {
  return <View style={tstyles.divider} />;
}

export function TabIcon({ name, focused }) {
  const icon = ICONS[name] || '?';
  return (
    <View style={tstyles.tabIconWrap}>
      <View style={[tstyles.tabLine, focused && { backgroundColor: COLORS.primary }]} />
      <Text style={[tstyles.tabIcon, { color: focused ? COLORS.text : COLORS.textMuted }]}>
        [{icon}]
      </Text>
      <View style={[tstyles.tabLine, focused && { backgroundColor: COLORS.primary }]} />
    </View>
  );
}

export function ProgressBar({ progress }) {
  const filled = Math.round(progress * 20);
  const bar = '█'.repeat(filled) + '░'.repeat(20 - filled);
  return (
    <View style={tstyles.progressRow}>
      <Text style={tstyles.progressText}>[{bar}]</Text>
    </View>
  );
}

export function Line({ children, color = COLORS.textSecondary }) {
  return <Text style={[tstyles.line, { color }]}>{children}</Text>;
}

export function Icon({ name, size = 14, color = COLORS.textSecondary }) {
  const icon = ICONS[name] || name;
  return (
    <Text style={{ fontFamily: 'monospace', fontSize: size, color, fontWeight: '700' }}>
      [{icon}]
    </Text>
  );
}

export function PageWrap({ children, style }) {
  return (
    <View style={[tstyles.page, style]}>
      {children}
    </View>
  );
}

export function ScreenTitle({ title, onBack, style }) {
  return (
    <View style={[tstyles.screenTitleRow, style]}>
      {onBack && (
        <TouchableOpacity onPress={onBack} style={tstyles.backBtn}>
          <Text style={tstyles.backText}>&lt; back</Text>
        </TouchableOpacity>
      )}
      <Text style={tstyles.screenTitle}>{title}</Text>
    </View>
  );
}

export function EmptyState({ icon, title, subtitle }) {
  return (
    <View style={tstyles.empty}>
      <Text style={tstyles.emptyIcon}>[{icon}]</Text>
      <Text style={tstyles.emptyTitle}>{title}</Text>
      {subtitle && <Text style={tstyles.emptySub}>{subtitle}</Text>}
    </View>
  );
}

export function StatRow({ stats }) {
  return (
    <View style={tstyles.statRow}>
      {stats.map((s, i) => (
        <View key={i} style={tstyles.statItem}>
          <Text style={tstyles.statVal}>{s.value}</Text>
          <Text style={tstyles.statLbl}>{s.label}</Text>
        </View>
      ))}
    </View>
  );
}

const tstyles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  box: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  prompt: {
    color: COLORS.terminal,
    fontSize: 20,
    fontFamily: 'monospace',
    fontWeight: '700',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
    fontFamily: 'monospace',
  },
  subtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontFamily: 'monospace',
    marginTop: 4,
  },
  btn: {
    borderWidth: 1,
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  btnText: {
    fontSize: 13,
    fontWeight: '600',
    fontFamily: 'monospace',
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: COLORS.inputBg,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 14,
    fontSize: 13,
    color: COLORS.text,
    fontFamily: 'monospace',
  },
  badge: {
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    fontFamily: 'monospace',
    letterSpacing: 1.5,
  },
  stat: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
    fontFamily: 'monospace',
  },
  statLabel: {
    fontSize: 10,
    color: COLORS.textSecondary,
    fontFamily: 'monospace',
    marginTop: 4,
    letterSpacing: 1,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 16,
  },
  tabIconWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabLine: {
    width: 20,
    height: 1,
    backgroundColor: 'transparent',
    marginBottom: 4,
  },
  tabIcon: {
    fontSize: 11,
    fontFamily: 'monospace',
    fontWeight: '700',
    letterSpacing: 1,
  },
  line: {
    fontSize: 13,
    fontFamily: 'monospace',
    lineHeight: 20,
  },
  progressRow: {
    marginTop: 4,
  },
  progressText: {
    color: COLORS.terminal,
    fontSize: 11,
    fontFamily: 'monospace',
    letterSpacing: 2,
  },
  screenTitleRow: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  backBtn: {
    marginBottom: 12,
  },
  backText: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontFamily: 'monospace',
  },
  screenTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.text,
    fontFamily: 'monospace',
  },
  empty: {
    alignItems: 'center',
    paddingTop: 80,
    paddingHorizontal: 32,
  },
  emptyIcon: {
    fontSize: 28,
    color: COLORS.textMuted,
    fontFamily: 'monospace',
    marginBottom: 16,
    fontWeight: '700',
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textSecondary,
    fontFamily: 'monospace',
  },
  emptySub: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontFamily: 'monospace',
    marginTop: 8,
    textAlign: 'center',
  },
  statRow: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
    marginBottom: 16,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statVal: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
    fontFamily: 'monospace',
  },
  statLbl: {
    fontSize: 10,
    color: COLORS.textMuted,
    fontFamily: 'monospace',
    marginTop: 4,
    letterSpacing: 1,
  },
});
