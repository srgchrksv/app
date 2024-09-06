import React, { useState } from 'react';
import { View, Button, Image, Alert, ActivityIndicator, StyleSheet, Dimensions } from 'react-native';
import { ThemedView } from './ThemedView';
import { ThemedText } from './ThemedText';
const { width: screenWidth } = Dimensions.get('window');
interface StabilityProps {
    apiKey: string;
    image: string | null;
    typeToGenerate: string;
    setGeneratedImage: React.Dispatch<React.SetStateAction<string | null>>;
}

const Stability: React.FC<StabilityProps> = ({ apiKey, image, typeToGenerate, setGeneratedImage }) => {
    const [loading, setLoading] = useState(false);
    const generatedImage = '';

    const fetchImage = async () => {
        try {
            setLoading(true);
            setGeneratedImage(null);
            const formData = new FormData();
            formData.append('prompt', typeToGenerate === 'Cake'
                ? 'fun cake from a bakery. studio photo, white background.'
                : 'fun stuffed toy. studio photo, white background.');
            formData.append('control_strength', '0.6');
            formData.append('output_format', 'webp');

            if (image) {
                // For React Native, we need to append the image differently
                formData.append('image', {
                    uri: image,
                    type: 'image/png', // Adjust this based on your image type
                    name: 'sketch.png',
                } as any);
            }

            const response = await fetch('https://api.stability.ai/v2beta/stable-image/control/sketch', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Accept': 'image/*',
                    'Content-Type': 'multipart/form-data',
                },
                body: formData,
            });

            if (response.ok) {
                const blob = await response.blob();
                const base64 = await new Promise((resolve) => {
                    const reader = new FileReader();
                    reader.onloadend = () => resolve(reader.result);
                    reader.readAsDataURL(blob);
                });
                setGeneratedImage(base64 as string);
                setLoading(false);
            } else {
                const errorText = await response.text();
                setLoading(false);
                console.error('Failed to fetch image:', response.status, errorText);
                Alert.alert('Error', `Failed to fetch image: ${response.status}`);
            }
        } catch (error) {
            setLoading(false);
            console.error('Error fetching image:', error);
            Alert.alert('Error', `Error fetching image: ${error}`);
        }
    };

    return (
        <ThemedView style={styles.container}>
            <Button     color="black" title="Do magic" onPress={fetchImage} />
            {loading && (
                <ThemedView>
                    <ThemedText>Your awesome {typeToGenerate.toUpperCase()} sketch gets some magic..</ThemedText>
                <ActivityIndicator size="large" color="#0000ff" />
                </ThemedView>
                )}
            {generatedImage && (
                <Image
                    source={{ uri: generatedImage }}
                    style={{ width:   screenWidth * 0.9, height: screenWidth * 0.9 }}
                />
            )}
        </ThemedView>
    );
};

const styles = StyleSheet.create({

    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
        gap: 8,
    }
})

export default Stability;