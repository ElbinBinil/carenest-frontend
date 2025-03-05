import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  StyleSheet,
  Text,
  FlatList,
  RefreshControl,
  Alert,
  Pressable, // Import Pressable
} from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { API_ENDPOINTS } from "../apiConfig";

interface Notice {
  _id: string;
  message: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export default function NoticeDetail() {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const fetchNotices = useCallback(async () => {
    try {
      const token = await AsyncStorage.getItem("authToken");
      if (!token) {
        setError("Authentication token missing.");
        setLoading(false);
        return;
      }

      const response = await axios.get(API_ENDPOINTS.NOTICE, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.success) {
        setNotices(response.data.data);
        setError(null);
      } else {
        setError(response.data.message || "Failed to fetch notices.");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred while fetching notices.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    fetchNotices();
  }, [fetchNotices]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchNotices();
  }, [fetchNotices]);

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <SafeAreaProvider>
        <View style={styles.container}>
          <Text>Loading notices...</Text>
        </View>
      </SafeAreaProvider>
    );
  }

  if (error) {
    return (
      <SafeAreaProvider>
        <View style={styles.container}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <View style={styles.container}>
        <Text style={styles.header}>Notice-Details</Text>
        <FlatList
          data={notices}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <View style={styles.noticeCard}>
              <View style={styles.noticeInfo}>
                <Text style={styles.noticeMessage}>{item.message}</Text>
                <Text style={styles.noticeDetails}>
                  Created At: {formatDate(item.createdAt)}
                </Text>
              </View>
            </View>
          )}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
    marginTop: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
    color: "#6200ea",
  },
  noticeCard: {
    backgroundColor: "#EDE0F9",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  noticeMessage: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#4A148C",
  },
  noticeDetails: {
    fontSize: 14,
    color: "#666",
  },
  errorText: {
    color: "red",
    textAlign: "center",
    marginTop: 20,
  },
  noticeInfo: {
    flex: 1,
  },
  fab: {
    position: "absolute",
    bottom: 30,
    right: 20,
    backgroundColor: "#6200ea",
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  fabText: {
    fontSize: 32,
    color: "#fff",
    fontWeight: "bold",
  },
});
