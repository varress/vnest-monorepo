import React, { useEffect, useState } from 'react';
import { Text, StyleSheet, Platform, View, Dimensions } from 'react-native';
import { historyService, GroupPerformance } from '@/services/historyService';

export default function HistoryScreen() {
    const [groupData, setGroupData] = useState<GroupPerformance[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        (async () => {
            try {
                const data = await historyService.getGroupPerformance();
                setGroupData(data);
            } catch (e: any) {
                setError(e.message || "unknown Error");
            } finally {
                setIsLoading(false);
            }
        })();
    }, []);

    if (Platform.OS === "web") return <Text>History is not available on Web</Text>
    if (isLoading) return <Text>Loading Hsitory</Text>;
    if (error) return <Text>Error: {error}</Text>;
    if (groupData?.length === 0) return <Text>No History available.</Text>;

    const screenHeight = Dimensions.get("window").height;
    const barArea = screenHeight * 0.4;
    const barHeight = barArea / groupData.length;

    return (
        <View style={styles.container}>
            {groupData.map((group) => (
                <View key={group.groupId} style={[styles.groupRow, {height: barHeight}]}>
                    <View style={styles.bar}>
                        <View style={styles.barBackground}>
                            <View style={[styles.correct, {width: `20%`}]}>
                            </View>
                            <Text style={[styles.text, {position: "absolute", top: "50%", transform: [{translateY: -19}], right: 20}]}>{group.groupName}</Text>
                        </View>
                    </View>
                    <Text style={[styles.text, {textAlign: "right", marginLeft: 10}]}>{Math.round(group.percentage)}%</Text>
                </View>
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 20,
        marginTop: "10%"
    },
    groupRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 20,
        width: "100%",
        justifyContent: "center"
    },
    barBackground: {
        flex: 1,
        flexDirection: "row",
        height: "100%",
        borderRadius: 12,
        overflow: "hidden",
        marginHorizontal: 8,
        backgroundColor: "#f0d48d",
        position: "relative"
    },
    correct: {
        backgroundColor: "#cedcab",
        position: "absolute",
        height: "100%"
    },
    bar: {
        width: "80%",
        height: "100%",
        borderRadius: 14,
        overflow: "hidden",
        position: "relative"
    },
    text: {
        fontSize: 30,
        fontWeight: "500",
        color: "black"
    }
})