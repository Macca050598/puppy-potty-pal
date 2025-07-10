import { getDogs, getToiletRecords, getFeedingRecords } from '../lib/appwrite';

export const fetchDogData = async () => {
    try {
        // Fetch all dogs
        const dogs = await getDogs();
        
        // For each dog, fetch their records
        const dogsWithRecords = await Promise.all(dogs.map(async (dog) => {
            const toiletRecords = await getToiletRecords(dog.$id);
            const feedingRecords = await getFeedingRecords(dog.$id);
            
            return {
                dog: {
                    id: dog.$id,
                    name: dog.name,
                    breed: dog.breed,
                    dob: dog.dob,
                    weight: dog.weight
                },
                toiletRecords: toiletRecords.map(record => ({
                    id: record.$id,
                    timestamp: record.timestamp,
                    type: record.type,
                    notes: record.notes
                })),
                feedingRecords: feedingRecords.map(record => ({
                    id: record.$id,
                    timestamp: record.timestamp,
                    foodType: record.foodType,
                    amount: record.amount,
                    notes: record.notes
                }))
            };
        }));

        return dogsWithRecords;
    } catch (error) {
        console.error('Error fetching dog data:', error);
        throw error;
    }
};

export const convertToCSV = (data) => {
    // Create headers
    const headers = [
        'Dog Name',
        'Breed',
        'Date of Birth',
        'Weight',
        'Record Type',
        'Timestamp',
        'Details',
        'Notes'
    ].join(',');

    // Convert data to rows
    const rows = data.flatMap(dogData => {
        const { dog, toiletRecords, feedingRecords } = dogData;
        
        // Convert toilet records
        const toiletRows = toiletRecords.map(record => [
            dog.name,
            dog.breed,
            dog.dob,
            dog.weight,
            'Toilet',
            record.timestamp,
            record.type,
            record.notes
        ].join(','));

        // Convert feeding records
        const feedingRows = feedingRecords.map(record => [
            dog.name,
            dog.breed,
            dog.dob,
            dog.weight,
            'Feeding',
            record.timestamp,
            `${record.foodType} - ${record.amount}`,
            record.notes
        ].join(','));

        return [...toiletRows, ...feedingRows];
    });

    // Combine headers and rows
    return [headers, ...rows].join('\n');
}; 