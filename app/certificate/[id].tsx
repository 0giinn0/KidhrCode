import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Linking, Share } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Clipboard from 'expo-clipboard';
import { supabase } from '../../lib/supabase';
import { COLORS } from '../../lib/constants';
import { getLevel, getRank } from '../../lib/gamification';

const BORDER = '╔═══════════════════════════════════════════════╗';
const BORDER_BOT = '╚═══════════════════════════════════════════════╝';
const DIVIDER = '╠═══════════════════════════════════════════════╣';
const STAR_LINE = '  ╔═══╗  ╔═══╗  ╔═══╗  ╔═══╗  ╔═══╗  ╔═══╗  ';
const STAR_FILL = '  ║ ★ ║  ║ ★ ║  ║ ★ ║  ║ ★ ║  ║ ★ ║  ║ ★ ║  ';
const STAR_BOT = '  ╚═══╝  ╚═══╝  ╚═══╝  ╚═══╝  ╚═══╝  ╚═══╝  ';

const VERIFY_BASE = 'https://kidhrcode.app/certificate/verify';

function certId() {
  return 'KHC-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).substring(2, 6).toUpperCase();
}

export default function CertificateDetail() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [course, setCourse] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState({ completed: 0, total: 0, xp: 0 });
  const [uniqueId] = useState(certId());

  useEffect(() => { loadData(); }, [id]);

  async function loadData() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.replace('/'); return; }
    setUser(user);

    const { data: courseData } = await supabase.from('courses').select('*').eq('id', id).single();
    if (!courseData) { setLoading(false); return; }
    setCourse(courseData);

    const { data: modules } = await supabase.from('modules').select('*, lessons(*)').eq('course_id', id);
    if (modules) {
      const lessonIds = modules.flatMap((m: any) => m.lessons?.map((l: any) => l.id) || []);
      const total = lessonIds.length;
      const { data: userProgress } = await supabase.from('user_progress').select('*').eq('user_id', user.id).in('lesson_id', lessonIds);
      const completed = userProgress?.filter((p: any) => p.completed).length || 0;
      const xp = userProgress?.reduce((s: number, p: any) => s + (p.xp_earned || 0), 0) || 0;
      setProgress({ completed, total, xp });
    }
    setLoading(false);
  }

  async function shareToLinkedIn() {
    const name = encodeURIComponent(course?.title || 'Course');
    const org = encodeURIComponent('KidhrCode');
    const issueDate = new Date().toISOString().split('T')[0];
    const verifyUrl = encodeURIComponent(`${VERIFY_BASE}/${uniqueId}`);
    const url = `https://www.linkedin.com/profile/add?startTask=CERTIFICATION_NAME&name=${name}&organizationName=${org}&issueDate=${issueDate}&certUrl=${verifyUrl}`;
    const supported = await Linking.canOpenURL(url);
    if (supported) {
      await Linking.openURL(url);
    } else {
      await Share.share({ message: `${VERIFY_BASE}/${uniqueId}` });
    }
  }

  async function copyLink() {
    await Clipboard.setStringAsync(`${VERIFY_BASE}/${uniqueId}`);
    alert('[ ok ] verification link copied');
  }

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="small" color={COLORS.terminal} />
      </View>
    );
  }

  if (!course || !user) return null;

  const rank = getRank(progress.xp);
  const level = getLevel(progress.xp);
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const hours = Math.round(progress.total * 1.5);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <TouchableOpacity onPress={() => router.back()} style={styles.back}>
        <Text style={styles.backText}>{'<'} back</Text>
      </TouchableOpacity>

      <View style={styles.certWrap}>
        <Text style={styles.border}>{BORDER}</Text>
        <Text style={styles.starLine}>{STAR_LINE}</Text>
        <Text style={styles.starLine}>{STAR_FILL}</Text>
        <Text style={styles.starLine}>{STAR_BOT}</Text>

        <Text style={styles.seal}>[ CERTIFICATE OF COMPLETION ]</Text>

        <Text style={styles.border}>{DIVIDER}</Text>

        <Text style={styles.body}>this certifies that</Text>
        <Text style={styles.userName}>{user.user_metadata?.username || user.email}</Text>

        <View style={styles.dividerDot}>
          <Text style={styles.dotText}>✦ ✦ ✦</Text>
        </View>

        <Text style={styles.body}>has successfully completed</Text>
        <Text style={styles.courseName}>{course.title}</Text>

        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Text style={styles.metaIcon}>[##]</Text>
            <Text style={styles.metaVal}>{progress.completed}/{progress.total}</Text>
            <Text style={styles.metaLbl}>lessons</Text>
          </View>
          <View style={styles.metaItem}>
            <Text style={styles.metaIcon}>[_>]</Text>
            <Text style={styles.metaVal}>{hours}h</Text>
            <Text style={styles.metaLbl}>duration</Text>
          </View>
          <View style={styles.metaItem}>
            <Text style={styles.metaIcon}>[!]</Text>
            <Text style={[styles.metaVal, { color: rank.color }]}>{rank.name}</Text>
            <Text style={styles.metaLbl}>rank</Text>
          </View>
          <View style={styles.metaItem}>
            <Text style={styles.metaIcon}>[[]]</Text>
            <Text style={styles.metaVal}>lv.{level}</Text>
            <Text style={styles.metaLbl}>level</Text>
          </View>
        </View>

        <Text style={styles.border}>{DIVIDER}</Text>

        <View style={styles.footerRow}>
          <View style={styles.footerItem}>
            <Text style={styles.footerLabel}>completed</Text>
            <Text style={styles.footerVal}>{dateStr}</Text>
          </View>
          <View style={styles.footerItem}>
            <Text style={styles.footerLabel}>language</Text>
            <Text style={styles.footerVal}>{course.language?.toUpperCase()}</Text>
          </View>
          <View style={styles.footerItem}>
            <Text style={styles.footerLabel}>difficulty</Text>
            <Text style={styles.footerVal}>{course.difficulty?.toUpperCase()}</Text>
          </View>
        </View>

        <View style={styles.signatureArea}>
          <Text style={styles.signatureLabel}>issued by</Text>
          <Text style={styles.signatureName}>KIDHRCODE</Text>
          <View style={styles.signatureLine} />
          <Text style={styles.signatureTitle}>terminal learning environment</Text>
        </View>

        <Text style={styles.border}>{DIVIDER}</Text>

        <View style={styles.verifyRow}>
          <Text style={styles.verifyIcon}>[?]</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.verifyLabel}>verify at</Text>
            <Text style={styles.verifyCode}>{VERIFY_BASE}/{uniqueId}</Text>
          </View>
          <TouchableOpacity onPress={copyLink}>
            <Text style={styles.copyBtn}>[copy]</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.border}>{BORDER_BOT}</Text>
      </View>

      <TouchableOpacity style={styles.linkedinBtn} onPress={shareToLinkedIn}>
        <Text style={styles.linkedinBtnText}>[ > ] add to linkedin</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.shareBtn} onPress={() => Share.share({ message: `${VERIFY_BASE}/${uniqueId}` })}>
        <Text style={styles.shareBtnText}>[ >> ] share certificate</Text>
      </TouchableOpacity>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { alignItems: 'center', paddingHorizontal: 16, paddingBottom: 40 },
  loading: { flex: 1, backgroundColor: COLORS.background, justifyContent: 'center', alignItems: 'center' },
  back: { alignSelf: 'flex-start', paddingTop: 60, marginBottom: 16 },
  backText: { color: COLORS.textSecondary, fontSize: 13, fontFamily: 'monospace' },
  certWrap: {
    width: '100%', backgroundColor: COLORS.surface,
    borderWidth: 1, borderColor: COLORS.border,
    paddingVertical: 12, paddingHorizontal: 8,
    alignItems: 'center',
  },
  border: { color: COLORS.textMuted, fontSize: 10, fontFamily: 'monospace', letterSpacing: 1 },
  starLine: { color: COLORS.terminal, fontSize: 9, fontFamily: 'monospace', letterSpacing: 1, opacity: 0.4 },
  seal: {
    fontSize: 13, fontWeight: '700', color: COLORS.terminal, fontFamily: 'monospace',
    letterSpacing: 3, marginVertical: 16,
  },
  body: { fontSize: 12, color: COLORS.textSecondary, fontFamily: 'monospace', textAlign: 'center', lineHeight: 22 },
  userName: {
    fontSize: 22, fontWeight: '700', color: COLORS.text, fontFamily: 'monospace',
    marginVertical: 8, textAlign: 'center',
  },
  dividerDot: { marginVertical: 12 },
  dotText: { color: COLORS.textMuted, fontSize: 14, fontFamily: 'monospace', letterSpacing: 6 },
  courseName: {
    fontSize: 16, fontWeight: '600', color: COLORS.prompt, fontFamily: 'monospace',
    textAlign: 'center', marginVertical: 8, lineHeight: 24,
  },
  metaRow: {
    flexDirection: 'row', borderWidth: 1, borderColor: COLORS.border,
    padding: 12, marginVertical: 16, width: '98%',
  },
  metaItem: { flex: 1, alignItems: 'center' },
  metaIcon: { color: COLORS.textMuted, fontSize: 10, fontFamily: 'monospace', marginBottom: 4 },
  metaVal: { fontSize: 14, fontWeight: '700', color: COLORS.text, fontFamily: 'monospace' },
  metaLbl: { fontSize: 9, color: COLORS.textMuted, fontFamily: 'monospace', marginTop: 2, letterSpacing: 1 },
  footerRow: {
    flexDirection: 'row', width: '100%', paddingHorizontal: 8,
    marginVertical: 12, justifyContent: 'center', gap: 16,
  },
  footerItem: { alignItems: 'center', flex: 1 },
  footerLabel: { fontSize: 9, color: COLORS.textMuted, fontFamily: 'monospace', letterSpacing: 1 },
  footerVal: { fontSize: 11, color: COLORS.text, fontFamily: 'monospace', marginTop: 4, fontWeight: '600' },
  signatureArea: { alignItems: 'center', marginVertical: 12, width: '100%' },
  signatureLabel: { fontSize: 9, color: COLORS.textMuted, fontFamily: 'monospace', letterSpacing: 1 },
  signatureName: { fontSize: 16, fontWeight: '700', color: COLORS.terminal, fontFamily: 'monospace', marginTop: 4 },
  signatureLine: { width: 180, height: 1, backgroundColor: COLORS.textMuted, marginVertical: 8 },
  signatureTitle: { fontSize: 10, color: COLORS.textSecondary, fontFamily: 'monospace', letterSpacing: 2 },
  verifyRow: {
    flexDirection: 'row', alignItems: 'center',
    width: '98%', marginVertical: 12,
    padding: 10, borderWidth: 1, borderColor: COLORS.borderLight,
  },
  verifyIcon: { color: COLORS.terminal, fontSize: 14, fontFamily: 'monospace', marginRight: 8 },
  verifyLabel: { fontSize: 9, color: COLORS.textMuted, fontFamily: 'monospace', letterSpacing: 1 },
  verifyCode: { fontSize: 10, color: COLORS.textSecondary, fontFamily: 'monospace', marginTop: 2 },
  copyBtn: { color: COLORS.prompt, fontSize: 11, fontFamily: 'monospace', fontWeight: '700' },
  linkedinBtn: {
    borderWidth: 1, borderColor: COLORS.prompt, paddingVertical: 14, paddingHorizontal: 32,
    marginTop: 20, alignItems: 'center', width: '100%',
  },
  linkedinBtnText: { color: COLORS.prompt, fontSize: 13, fontFamily: 'monospace', fontWeight: '700' },
  shareBtn: {
    borderWidth: 1, borderColor: COLORS.border, paddingVertical: 14, paddingHorizontal: 32,
    marginTop: 10, alignItems: 'center', width: '100%',
  },
  shareBtnText: { color: COLORS.textSecondary, fontSize: 13, fontFamily: 'monospace' },
});
