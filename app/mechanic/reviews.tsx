import React from 'react';
import { StyleSheet, View, Text, ScrollView } from 'react-native';
import { useMechanic } from '@/components/MechanicContext';
import Header from '@/components/Header';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

export default function ReviewsScreen() {
  const { reviews, darkMode } = useMechanic();

  const activeBg = darkMode ? '#151718' : '#F8FAFC';
  const cardBg = darkMode ? '#1E2022' : '#FFFFFF';
  const textPrimary = darkMode ? '#ECEDEE' : '#0F172A';
  const textSecondary = darkMode ? '#9BA1A6' : '#64748B';
  const cardBorder = darkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.06)';

  // Mock distribution percentages
  const distribution = [
    { stars: 5, percent: 85 },
    { stars: 4, percent: 12 },
    { stars: 3, percent: 3 },
    { stars: 2, percent: 0 },
    { stars: 1, percent: 0 },
  ];

  const renderStars = (rating: number) => {
    const stars = [];
    const floorRating = Math.floor(rating);
    for (let i = 1; i <= 5; i++) {
      if (i <= floorRating) {
        stars.push(<Ionicons key={i} name="star" size={14} color="#F59E0B" />);
      } else if (i - rating < 1) {
        stars.push(<Ionicons key={i} name="star-half" size={14} color="#F59E0B" />);
      } else {
        stars.push(<Ionicons key={i} name="star-outline" size={14} color="#F59E0B" />);
      }
    }
    return stars;
  };

  return (
    <View style={[styles.container, { backgroundColor: activeBg }]}>
      {/* Header Bar */}
      <Header title="Customer Reviews" showBack darkMode={darkMode} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Rating Metrics & Star Distribution Widget */}
        <View style={[styles.summaryCard, { backgroundColor: cardBg, borderColor: cardBorder }]}>
          <View style={styles.metricsHeader}>
            <View style={styles.scoreContainer}>
              <Text style={[styles.ratingScore, { color: textPrimary }]}>4.9</Text>
              <View style={styles.ratingStarsRow}>{renderStars(4.9)}</View>
              <Text style={[styles.reviewCountText, { color: textSecondary }]}>Based on {reviews.length} clients</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.distributionBox}>
              {distribution.map((dist) => (
                <View key={dist.stars} style={styles.distRow}>
                  <Text style={[styles.distStarLabel, { color: textSecondary }]}>{dist.stars}</Text>
                  <Ionicons name="star" size={10} color={textSecondary} style={styles.miniStar} />
                  <View style={[styles.progressBarBg, { backgroundColor: darkMode ? 'rgba(255, 255, 255, 0.08)' : '#E2E8F0' }]}>
                    <View style={[styles.progressBarActive, { width: `${dist.percent}%` }]} />
                  </View>
                  <Text style={[styles.distPercentLabel, { color: textSecondary }]}>{dist.percent}%</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Verified Reviews Feed */}
        <Text style={[styles.sectionTitle, { color: textPrimary }]}>Customer Reviews ({reviews.length})</Text>
        {reviews.map((rev) => (
          <View key={rev.id} style={[styles.reviewCard, { backgroundColor: cardBg, borderColor: cardBorder }]}>
            <View style={styles.reviewHeader}>
              <View>
                <Text style={[styles.reviewerName, { color: textPrimary }]}>{rev.customerName}</Text>
                <Text style={[styles.reviewDate, { color: textSecondary }]}>{rev.date}</Text>
              </View>

              <View style={styles.starsContainer}>
                {renderStars(rev.rating)}
              </View>
            </View>

            {/* Service rendered subtitle */}
            <View style={[styles.serviceRow, { borderBottomColor: cardBorder }]}>
              <MaterialCommunityIcons name="wrench-outline" size={13} color="#F59E0B" />
              <Text style={[styles.serviceText, { color: textSecondary }]}>Service: {rev.service}</Text>
            </View>

            {/* Review feedback text */}
            <Text style={[styles.commentText, { color: textPrimary }]}>
              "{rev.comment}"
            </Text>
          </View>
        ))}

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  summaryCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 20,
    marginBottom: 20,
  },
  metricsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scoreContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  ratingScore: {
    fontSize: 38,
    fontWeight: '900',
    letterSpacing: -1,
  },
  ratingStarsRow: {
    flexDirection: 'row',
    gap: 2,
    marginVertical: 6,
  },
  reviewCountText: {
    fontSize: 10,
    fontWeight: '600',
  },
  divider: {
    width: 1,
    height: 100,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    marginHorizontal: 16,
  },
  distributionBox: {
    flex: 1.5,
    gap: 4,
  },
  distRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  distStarLabel: {
    fontSize: 10,
    fontWeight: '700',
    width: 10,
    textAlign: 'center',
  },
  miniStar: {
    marginHorizontal: 4,
  },
  progressBarBg: {
    height: 5,
    borderRadius: 2.5,
    flex: 1,
    overflow: 'hidden',
  },
  progressBarActive: {
    height: '100%',
    backgroundColor: '#F59E0B',
    borderRadius: 2.5,
  },
  distPercentLabel: {
    fontSize: 10,
    fontWeight: '700',
    width: 30,
    textAlign: 'right',
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.3,
    marginBottom: 14,
  },
  reviewCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 14,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  reviewerName: {
    fontSize: 14,
    fontWeight: '700',
  },
  reviewDate: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 2,
  },
  starsContainer: {
    flexDirection: 'row',
    gap: 2,
  },
  serviceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    paddingBottom: 8,
    marginBottom: 10,
    gap: 6,
  },
  serviceText: {
    fontSize: 12,
    fontWeight: '600',
  },
  commentText: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500',
    fontStyle: 'italic',
  },
});
