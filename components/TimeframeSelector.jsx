const TimeframeSelector = ({ selected, onSelect, colors }) => {
  const options = [
    { label: 'Week', value: 'week' },
    { label: 'Month', value: 'month' },
    { label: 'Year', value: 'year' },
  ];

  return (
    <View style={styles.container}>
      {options.map(option => (
        <TouchableOpacity
          key={option.value}
          style={[
            styles.option,
            { 
              backgroundColor: selected === option.value ? colors.primary : colors.card,
            }
          ]}
          onPress={() => onSelect(option.value)}
        >
          <Text style={[
            styles.optionText,
            { color: selected === option.value ? colors.white : colors.text }
          ]}>
            {option.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}; 