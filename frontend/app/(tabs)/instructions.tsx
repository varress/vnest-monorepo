import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';
import { getThemedColors } from '@/constants/colors';

export default function InstructionsScreen() {
  const router = useRouter();
  const { isDarkMode, highContrast } = useTheme();
  const colors = getThemedColors(isDarkMode, highContrast);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.backgroundGray }]}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Ohjeet</Text>
      </View>

      <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.content}>
        <View style={[styles.section, { borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.primary }]}>
            VNeST TerapiaApp - Käyttöohjeet
          </Text>
          
          <Text style={[styles.paragraph, { color: colors.text }]}>
            Tämä sovellus perustuu VNeST-menetelmään (Verb Network Strengthening Treatment), joka on afasian kuntoutukseen kehitetty menetelmä. Menetelmän ydinajatus on vahvistaa verbien ympärille rakentuvia sanaverkostoja eli niitä yhteyksiä, joita aivot muodostavat tekijän (subjektin), tekemisen (verbin) ja kohteen (objektin) välille. Kun nämä yhteydet vahvistuvat, sanahaku ja lauseiden muodostaminen helpottuvat myös arjen tilanteissa.
          </Text>
          
          <Text style={[styles.paragraph, { color: colors.text }]}>
            Sovelluksessa tehtävänäsi on muodostaa kolmen sanan lauseita. Valitse haluamasi taso, ja näytölle ilmestyy verbi, jota täydennetään sitä vastaavalla tekijällä (subjekti) sekä kohteella (objekti). Tavoitteena on löytää mahdollisimman loogisia ja toisiinsa liittyviä yhdistelmiä.
          </Text>
          
          <Text style={[styles.paragraph, { color: colors.text }]}>
            <Text style={styles.bold}>Vinkki harjoitteluun:</Text> Lue muodostamasi lauseet ääneen. Ääneen lukeminen aktivoi laajempia kielialueita aivoissa ja tukee oppimista tehokkaasti.
          </Text>
        </View>

        <View style={[styles.section, { borderColor: colors.border }]}>
          <Text style={[styles.subTitle, { color: colors.primary }]}>
            Pelin kulku
          </Text>
          
          <Text style={[styles.paragraph, { color: colors.text }]}>
            1. Valitse <Text style={styles.bold}>Aloita peli</Text> aloittaaksesi harjoituksen
          </Text>
          
          <Text style={[styles.paragraph, { color: colors.text }]}>
            2. Näet kolme korttityyppiä:
          </Text>
          
          <View style={styles.bulletPoint}>
            <Text style={[styles.bullet, { color: colors.primary }]}>•</Text>
            <Text style={[styles.bulletText, { color: colors.text }]}>
              <Text style={styles.bold}>Verbi</Text> (keskellä) - esim. "syödä"
            </Text>
          </View>
          
          <View style={styles.bulletPoint}>
            <Text style={[styles.bullet, { color: colors.primary }]}>•</Text>
            <Text style={[styles.bulletText, { color: colors.text }]}>
              <Text style={styles.bold}>Subjekti</Text> (vasemmalla) - esim. "Minä", "Sinä"
            </Text>
          </View>
          
          <View style={styles.bulletPoint}>
            <Text style={[styles.bullet, { color: colors.primary }]}>•</Text>
            <Text style={[styles.bulletText, { color: colors.text }]}>
              <Text style={styles.bold}>Kohde</Text> (oikealla) - esim. "omena", "leipä"
            </Text>
          </View>
          
          <Text style={[styles.paragraph, { color: colors.text }]}>
            3. Yhdistä kortit vetämällä viiva subjektista kohteeseen
          </Text>
          
          <Text style={[styles.paragraph, { color: colors.text }]}>
            4. Saat palautetta yhdistämisestä - oikeat vastaukset näkyvät vihreänä
          </Text>
        </View>

        <View style={[styles.section, { borderColor: colors.border }]}>
          <Text style={[styles.subTitle, { color: colors.primary }]}>
            Edistymisen seuranta
          </Text>
          
          <Text style={[styles.paragraph, { color: colors.text }]}>
            • <Text style={styles.bold}>Edistyminen</Text>-välilehdessä näet tilastoja suorituksistasi
          </Text>
          
          <Text style={[styles.paragraph, { color: colors.text }]}>
            • <Text style={styles.bold}>Edistyminen</Text>-välilehdessä voit tarkastella aiempia pelejä
          </Text>
        </View>

        <View style={[styles.section, { borderColor: colors.border }]}>
          <Text style={[styles.subTitle, { color: colors.primary }]}>
            Asetukset
          </Text>
          
          <Text style={[styles.paragraph, { color: colors.text }]}>
            • Vaihda tumman ja vaalean tilan välillä
          </Text>
          
          <Text style={[styles.paragraph, { color: colors.text }]}>
            • Ota käyttöön korkea kontrasti paremman näkyvyyden saamiseksi
          </Text>
          
          <Text style={[styles.paragraph, { color: colors.text }]}>
            • Muokkaa pelin asetuksia tarpeidesi mukaan
          </Text>
        </View>

        <View style={[styles.section, { borderColor: colors.border }]}>
          <Text style={[styles.subTitle, { color: colors.primary }]}>
            Vinkkejä
          </Text>
          
          <Text style={[styles.paragraph, { color: colors.text }]}>
            • Ota aikasi miettimään oikeita yhdistelmiä
          </Text>
          
          <Text style={[styles.paragraph, { color: colors.text }]}>
            • Harjoittele säännöllisesti paremman oppimistuloksen saavuttamiseksi
          </Text>
          
          <Text style={[styles.paragraph, { color: colors.text }]}>
            • Jos kohtaat vaikeuksia, kokeile erilaisia yhdistelmiä ja opi virheistäsi
          </Text>
        </View>

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: colors.textLight }]}>
            VNeST TerapiaApp - Versio 1.0
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 50,
    elevation: 2,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 16,
  },
  scrollContainer: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  subTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  paragraph: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 12,
  },
  bulletPoint: {
    flexDirection: 'row',
    marginBottom: 8,
    paddingLeft: 16,
  },
  bullet: {
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 8,
  },
  bulletText: {
    fontSize: 16,
    lineHeight: 24,
    flex: 1,
  },
  bold: {
    fontWeight: 'bold',
  },
  footer: {
    alignItems: 'center',
    marginTop: 32,
    paddingTop: 16,
  },
  footerText: {
    fontSize: 14,
    fontStyle: 'italic',
  },
});