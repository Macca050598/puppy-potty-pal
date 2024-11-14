const DogSelector = ({ selectedDog, onSelectDog, colors }) => {
  const { data: dogs } = useAppwrite(getUserAndFamilyDogs);

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: colors.text }]}>Select Dog</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {dogs.map(dog => (
          <TouchableOpacity
            key={dog.$id}
            style={[
              styles.dogButton,
              { 
                backgroundColor: selectedDog?.$id === dog.$id ? colors.primary : colors.card,
              }
            ]}
            onPress={() => onSelectDog(dog)}
          >
            <Text style={[
              styles.dogName,
              { color: selectedDog?.$id === dog.$id ? colors.white : colors.text }
            ]}>
              {dog.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}; 