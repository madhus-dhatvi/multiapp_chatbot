import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { colors } from '../../../theme';
import { orderService } from '../../../api/orderService';
import { RecentOrder } from '../../../types/order';

// ── Status badge color mapping ──────────────────────────────────────
const getStatusStyle = (status: string) => {
  const s = status?.toLowerCase();
  if (s === 'delivered' || s === 'completed')
    return { bg: colors.successLight, text: colors.successDark };
  if (s === 'cancelled' || s === 'failed')
    return { bg: colors.notAvailableBg, text: colors.notAvailableText };
  if (s === 'preparing' || s === 'in_progress' || s === 'accepted')
    return { bg: colors.partialBg, text: colors.partialText };
  if (s === 'out_for_delivery' || s === 'dispatched')
    return { bg: colors.statusTransitBg, text: colors.statusTransit };
  if (s === 'pending')
    return { bg: colors.statusPendingBg, text: colors.statusPendingText };
  return { bg: colors.backgroundLight, text: colors.primary };
};

// ── SVG Icons ───────────────────────────────────────────────────────
const StoreIcon = () => (
  <Svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke={colors.secondary}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round">
    <Path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <Path d="M9 22V12h6v10" />
  </Svg>
);

const ClockIcon = () => (
  <Svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke={colors.gray500}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round">
    <Circle cx="12" cy="12" r="10" />
    <Path d="M12 6v6l4 2" />
  </Svg>
);

const PackageIcon = () => (
  <Svg
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill="none"
    stroke={colors.secondary}
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round">
    <Path d="M16.5 9.4l-9-5.19" />
    <Path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
    <Path d="M3.27 6.96L12 12.01l8.73-5.05" />
    <Path d="M12 22.08V12" />
  </Svg>
);

const ChevronRightIcon = () => (
  <Svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke={colors.gray500}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round">
    <Path d="M9 18l6-6-6-6" />
  </Svg>
);

// ── Helpers ─────────────────────────────────────────────────────────
const formatDate = (iso: string): string => {
  const date = new Date(iso);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const mins = Math.floor(diff / 60000);
  const hrs = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  if (hrs < 24) return `${hrs}h ago`;
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  });
};

const formatCurrency = (amount: number): string => {
  return `₹${amount.toFixed(2)}`;
};

// ── Order Card ──────────────────────────────────────────────────────
const OrderCard = ({ order, onPress }: { order: RecentOrder; onPress?: (order: RecentOrder) => void }) => {
  const statusStyle = getStatusStyle(order.orderStatus);
  const displayStatus = order.orderStatus?.replace(/_/g, ' ') || 'Unknown';

  return (
    <TouchableOpacity style={cardStyles.container} activeOpacity={0.7} onPress={() => onPress?.(order)}>
      {/* Left accent bar */}
      <View
        style={[cardStyles.accentBar, { backgroundColor: statusStyle.text }]}
      />

      <View style={cardStyles.body}>
        {/* Top row: store + status */}
        <View style={cardStyles.topRow}>
          <View style={cardStyles.storeRow}>
            <StoreIcon />
            <Text style={cardStyles.storeName} numberOfLines={1}>
              {order.restaurantName || 'Restaurant'}
            </Text>
          </View>
          <View
            style={[
              cardStyles.statusBadge,
              { backgroundColor: statusStyle.bg },
            ]}>
            <Text style={[cardStyles.statusText, { color: statusStyle.text }]}>
              {displayStatus}
            </Text>
          </View>
        </View>

        {/* Items summary */}
        {order.itemsSummary ? (
          <Text style={cardStyles.items} numberOfLines={2}>
            {order.itemsSummary}
          </Text>
        ) : null}

        {/* Bottom row: time + amount */}
        <View style={cardStyles.bottomRow}>
          <View style={cardStyles.timeRow}>
            <ClockIcon />
            <Text style={cardStyles.time}>{formatDate(order.placedAt)}</Text>
          </View>
          <View style={cardStyles.amountRow}>
            <Text style={cardStyles.amount}>
              {formatCurrency(order.totalAmount)}
            </Text>
            <ChevronRightIcon />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

// ── Empty State ─────────────────────────────────────────────────────
const EmptyState = () => (
  <View style={emptyStyles.container}>
    <View style={emptyStyles.iconWrap}>
      <PackageIcon />
    </View>
    <Text style={emptyStyles.title}>No recent orders</Text>
    <Text style={emptyStyles.subtitle}>
      Your recent orders will appear here
    </Text>
  </View>
);

// ── Error State ─────────────────────────────────────────────────────
const ErrorState = ({ onRetry }: { onRetry: () => void }) => (
  <View style={errorStyles.container}>
    <Text style={errorStyles.message}>Unable to load orders</Text>
    <TouchableOpacity style={errorStyles.retryButton} onPress={onRetry}>
      <Text style={errorStyles.retryText}>Retry</Text>
    </TouchableOpacity>
  </View>
);

// ── Main Component ──────────────────────────────────────────────────
interface RecentOrdersProps {
  onOrderPress?: (order: RecentOrder) => void;
}

export const RecentOrders = ({ onOrderPress }: RecentOrdersProps) => {
  const [orders, setOrders] = useState<RecentOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(false);

  const fetchOrders = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(false);
      const data = await orderService.getRecentOrders();
      setOrders(data);
    } catch (err) {
      console.warn('Failed to fetch recent orders:', err);
      setError(true);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // ── Loading skeleton ──────────────────────────────────────────────
  if (loading) {
    return (
      <View style={sectionStyles.wrapper}>
        <Text style={sectionStyles.heading}>Recent Orders</Text>
        <View style={skeletonStyles.container}>
          {[1, 2].map(i => (
            <View key={i} style={skeletonStyles.card}>
              <View style={skeletonStyles.line1} />
              <View style={skeletonStyles.line2} />
              <View style={skeletonStyles.line3} />
            </View>
          ))}
        </View>
      </View>
    );
  }

  return (
    <View style={sectionStyles.wrapper}>
      {/* Section header */}
      <View style={sectionStyles.headerRow}>
        <Text style={sectionStyles.heading}>Recent Orders</Text>
        {orders.length > 0 && (
          <View style={sectionStyles.countBadge}>
            <Text style={sectionStyles.countText}>{orders.length}</Text>
          </View>
        )}
      </View>

      {/* Content */}
      {error ? (
        <ErrorState onRetry={() => fetchOrders()} />
      ) : orders.length === 0 ? (
        <EmptyState />
      ) : (
        <FlatList
          data={orders}
          keyExtractor={item => item.orderId}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={sectionStyles.listContent}
          renderItem={({ item }) => <OrderCard order={item} onPress={onOrderPress} />}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => fetchOrders(true)}
              colors={[colors.secondary]}
              tintColor={colors.secondary}
            />
          }
        />
      )}
    </View>
  );
};

// ════════════════════════════════════════════════════════════════════
// STYLES
// ════════════════════════════════════════════════════════════════════

const sectionStyles = StyleSheet.create({
  wrapper: {
    marginBottom: 8,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  heading: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.primary,
  },
  countBadge: {
    backgroundColor: colors.secondary,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    minWidth: 24,
    alignItems: 'center',
  },
  countText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  listContent: {
    paddingHorizontal: 12,
    paddingBottom: 4,
    gap: 12,
  },
});

const cardStyles = StyleSheet.create({
  container: {
    width: 280,
    backgroundColor: colors.cardBackground,
    borderRadius: 14,
    flexDirection: 'row',
    overflow: 'hidden',
    // Shadow
    shadowColor: colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: colors.border1,
  },
  accentBar: {
    width: 4,
  },
  body: {
    flex: 1,
    padding: 14,
    gap: 10,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  storeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
    marginRight: 8,
  },
  storeName: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.primary,
    flex: 1,
  },
  statusBadge: {
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  items: {
    fontSize: 13,
    color: colors.gray500,
    lineHeight: 18,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 2,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  time: {
    fontSize: 12,
    color: colors.gray500,
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  amount: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.secondary,
  },
});

const skeletonStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    gap: 12,
  },
  card: {
    width: 280,
    backgroundColor: colors.backgroundLight,
    borderRadius: 14,
    padding: 16,
    gap: 12,
  },
  line1: {
    height: 14,
    width: '60%',
    backgroundColor: colors.border1,
    borderRadius: 6,
  },
  line2: {
    height: 10,
    width: '90%',
    backgroundColor: colors.border1,
    borderRadius: 6,
  },
  line3: {
    height: 10,
    width: '40%',
    backgroundColor: colors.border1,
    borderRadius: 6,
  },
});

const emptyStyles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 16,
    marginHorizontal: 16,
    backgroundColor: colors.backgroundLight,
    borderRadius: 14,
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.secondaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.primary,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: colors.gray500,
  },
});

const errorStyles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 16,
    marginHorizontal: 16,
    backgroundColor: colors.notAvailableBg,
    borderRadius: 14,
  },
  message: {
    fontSize: 14,
    color: colors.notAvailableText,
    marginBottom: 10,
  },
  retryButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    backgroundColor: colors.cardBackground,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.notAvailableIndicator,
  },
  retryText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.notAvailableText,
  },
});
