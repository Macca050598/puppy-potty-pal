import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useTheme } from '../config/theme';
import { format } from 'date-fns';

const EditAlertModal = ({ isVisible, onClose, onSave, alert }) => {
  const { colors } = useTheme();
  const [title, setTitle] = useState('');
  const [dateTime, setDateTime] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  useEffect(() => {
    if (alert) {
      setTitle(alert.title);
      setDateTime(new Date(alert.time));
    } else {
      setTitle('');
      setDateTime(new Date());
    }
  }, [alert]);

  const handleSave = () => {
    onSave({
      id: alert ? alert.id : Date.now().toString(),
      title,
      time: dateTime.toISOString(),
      isEnabled: true,
    });
    onClose();
  };

  const onDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || dateTime;
    setShowDatePicker(false);
    setDateTime(currentDate);
  };

  const onTimeChange = (event, selectedTime) => {
    const currentTime = selectedTime || dateTime;
    setShowTimePicker(false);
    setDateTime(currentTime);
  };

  return (
    <Modal
      visible={isVisible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.centeredView}>
        <View style={[styles.modalView, { backgroundColor: colors.background }]}>
          <Text style={[styles.modalTitle, { color: colors.text }]}>
            {alert ? 'Edit Alert' : 'Add New Alert'}
          </Text>
          <TextInput
            style={[styles.input, { color: colors.text, borderColor: colors.border }]}
            placeholder="Alert Title"
            placeholderTextColor={colors.tint}
            value={title}
            onChangeText={setTitle}
          />
          <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.dateTimeButton}>
            <Text style={[styles.dateTimeButtonText, { color: colors.primary }]}>
              {format(dateTime, 'MMMM d, yyyy')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setShowTimePicker(true)} style={styles.dateTimeButton}>
            <Text style={[styles.dateTimeButtonText, { color: colors.primary }]}>
              {format(dateTime, 'h:mm a')}
            </Text>
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              value={dateTime}
              mode="date"
              display="default"
              onChange={onDateChange}
            />
          )}
          {showTimePicker && (
            <DateTimePicker
              value={dateTime}
              mode="time"
              is24Hour={true}
              display="default"
              onChange={onTimeChange}
            />
          )}
          <View style={styles.buttonContainer}>
            <TouchableOpacity onPress={onClose} style={[styles.button, { backgroundColor: colors.text }]}>
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleSave} style={[styles.button, { backgroundColor: colors.primary }]}>
              <Text style={styles.buttonText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    margin: 20,
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  input: {
    width: '100%',
    padding: 10,
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 15,
  },
  timeButton: {
    padding: 10,
    borderRadius: 5,
    marginBottom: 15,
  },
  timeButtonText: {
    fontSize: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  button: {
    borderRadius: 5,
    padding: 10,
    elevation: 2,
    minWidth: 100,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  dateTimeButton: {
    padding: 10,
    borderRadius: 5,
    marginBottom: 15,
    width: '100%',
    alignItems: 'center',
  },
  dateTimeButtonText: {
    fontSize: 16,
  },
});

export default EditAlertModal;