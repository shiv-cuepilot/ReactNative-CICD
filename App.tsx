import React from 'react';
import {
  SafeAreaView,
  StatusBar,
  Text,
  StyleSheet,
  View,
  TouchableOpacity,
  Linking,
  Platform,
} from 'react-native';
import Config from 'react-native-config';

// SnapBiodata brand palette (matches the web app: warm maroon + gold wedding theme).
const C = {
  canvas: '#faf6f2',
  surface: '#ffffff',
  ink: '#2a2025',
  muted: '#7c7077',
  line: '#ece3da',
  maroon: '#9b1c3a',
  maroonDark: '#7d1530',
  gold: '#c79a3a',
  goldSoft: '#f3e7c8',
};

const serif = Platform.select({ ios: 'Georgia', android: 'serif', default: 'serif' });

function App(): React.JSX.Element {
  const apiUrl = Config.API_URL;

  const open = (url: string) => {
    Linking.openURL(url).catch(() => {});
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={C.canvas} />

      {/* Brand */}
      <View style={styles.brandRow}>
        <View style={styles.badge}>
          <Text style={styles.badgeGlyph}>♥</Text>
        </View>
        <Text style={styles.wordmark}>SnapBiodata</Text>
      </View>

      {/* Hero */}
      <View style={styles.hero}>
        <Text style={styles.flourish}>✦ ✦ ✦</Text>
        <Text style={styles.title}>
          Marriage biodata,{'\n'}made beautiful.
        </Text>
        <Text style={styles.subtitle}>
          Pick a template, add your details and a photo, then download a
          print-ready PDF — 100% free, no sign-up.
        </Text>

        <View style={styles.pills}>
          {['Free', 'No sign-up', 'Print-ready PDF'].map(p => (
            <View key={p} style={styles.pill}>
              <Text style={styles.pillText}>{p}</Text>
            </View>
          ))}
        </View>

        <TouchableOpacity
          activeOpacity={0.85}
          style={styles.cta}
          onPress={() => open('https://snapbiodata.com/create')}>
          <Text style={styles.ctaText}>Create biodata</Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.6}
          style={styles.secondary}
          onPress={() => open('https://snapbiodata.com')}>
          <Text style={styles.secondaryText}>Browse templates</Text>
        </TouchableOpacity>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerBrand}>snapbiodata.com</Text>
        {apiUrl ? (
          <View style={styles.envChip}>
            <Text style={styles.envText} numberOfLines={1}>
              {apiUrl}
            </Text>
          </View>
        ) : null}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: C.canvas,
    paddingHorizontal: 24,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingTop: 12,
  },
  badge: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: C.maroon,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: C.gold,
  },
  badgeGlyph: { color: '#fff', fontSize: 17 },
  wordmark: {
    fontFamily: serif,
    fontSize: 20,
    fontWeight: '700',
    color: C.ink,
    letterSpacing: 0.2,
  },

  hero: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  flourish: {
    color: C.gold,
    letterSpacing: 6,
    fontSize: 14,
    marginBottom: 18,
  },
  title: {
    fontFamily: serif,
    fontSize: 34,
    lineHeight: 42,
    fontWeight: '700',
    color: C.ink,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15.5,
    lineHeight: 23,
    color: C.muted,
    textAlign: 'center',
    marginTop: 14,
    maxWidth: 320,
  },
  pills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    marginTop: 22,
  },
  pill: {
    backgroundColor: C.goldSoft,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  pillText: { color: C.maroonDark, fontSize: 12.5, fontWeight: '600' },

  cta: {
    marginTop: 30,
    alignSelf: 'stretch',
    backgroundColor: C.maroon,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: C.maroon,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.28,
    shadowRadius: 12,
    elevation: 4,
  },
  ctaText: { color: '#fff', fontSize: 16.5, fontWeight: '700', letterSpacing: 0.3 },
  secondary: { marginTop: 14, paddingVertical: 8 },
  secondaryText: { color: C.maroon, fontSize: 15, fontWeight: '600' },

  footer: { alignItems: 'center', paddingBottom: 10, gap: 8 },
  footerBrand: { color: C.muted, fontSize: 13, fontWeight: '600' },
  envChip: {
    backgroundColor: C.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: C.line,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
    maxWidth: '100%',
  },
  envText: { color: C.muted, fontSize: 11, fontStyle: 'italic' },
});

export default App;
