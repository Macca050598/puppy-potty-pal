import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import * as FileSystem from 'react-native-fs';
import Share from 'react-native-share';
import { format } from 'date-fns';
import { fetchDogData, convertToCSV } from '../utils/exportData';

const ExportData = ({ isVisible, onClose, colors }) => {
    const [loading, setLoading] = useState(false);
    const [exportFormat, setExportFormat] = useState(null);

    const exportData = async (format) => {
        setLoading(true);
        try {
            const data = await fetchDogData();
            
            let fileContent;
            let fileName;
            let mimeType;

            switch (format) {
                case 'csv':
                    fileContent = convertToCSV(data);
                    fileName = `dog_data_${format(new Date(), 'yyyy-MM-dd')}.csv`;
                    mimeType = 'text/csv';
                    break;
                case 'json':
                    fileContent = JSON.stringify(data, null, 2);
                    fileName = `dog_data_${format(new Date(), 'yyyy-MM-dd')}.json`;
                    mimeType = 'application/json';
                    break;
                default:
                    throw new Error('Unsupported format');
            }

            // Save file temporarily
            const filePath = `${FileSystem.CachesDirectoryPath}/${fileName}`;
            await FileSystem.writeFile(filePath, fileContent, 'utf8');

            // Share file
            await Share.open({
                url: `file://${filePath}`,
                type: mimeType,
                filename: fileName,
            });

            Alert.alert('Success', 'Data exported successfully!');
        } catch (error) {
            console.error('Export error:', error);
            Alert.alert('Error', 'Failed to export data. Please try again.');
        } finally {
            setLoading(false);
            onClose();
        }
    };

    const styles = StyleSheet.create({
        modalOverlay: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
        },
        modalContent: {
            backgroundColor: colors.background,
            borderRadius: 20,
            padding: 20,
            width: '80%',
            maxWidth: 300,
        },
        title: {
            fontSize: 18,
            fontWeight: 'bold',
            marginBottom: 20,
            textAlign: 'center',
            color: colors.text,
        },
        button: {
            backgroundColor: colors.primary,
            padding: 15,
            borderRadius: 10,
            marginVertical: 10,
        },
        buttonText: {
            color: colors.accent,
            textAlign: 'center',
            fontWeight: 'bold',
        },
        loadingContainer: {
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
        },
    });

    return (
        <Modal visible={isVisible} animationType="fade" transparent={true}>
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <Text style={styles.title}>Export Data</Text>
                    
                    <TouchableOpacity 
                        style={styles.button}
                        onPress={() => exportData('csv')}
                    >
                        <Text style={styles.buttonText}>Export as CSV</Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                        style={styles.button}
                        onPress={() => exportData('json')}
                    >
                        <Text style={styles.buttonText}>Export as JSON</Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                        style={[styles.button, { backgroundColor: colors.secondary }]}
                        onPress={onClose}
                    >
                        <Text style={styles.buttonText}>Cancel</Text>
                    </TouchableOpacity>

                    {loading && (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="large" color={colors.primary} />
                        </View>
                    )}
                </View>
            </View>
        </Modal>
    );
};

export default ExportData; 