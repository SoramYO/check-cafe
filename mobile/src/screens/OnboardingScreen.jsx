import React, { useRef, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    Dimensions,
    TouchableOpacity,
    Image,
    Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

const ONBOARDING_DATA = [
    {
        id: '1',
        title: 'Khám phá quán cà phê',
        description: 'Tìm kiếm và khám phá những quán cà phê tuyệt vời ở Đà Lạt với view đẹp và không gian độc đáo.',
        image: 'https://images.unsplash.com/photo-1493857671505-72967e2e2760?q=80&w=2940&auto=format&fit=crop',
        features: [
            { icon: 'magnify', text: 'Tìm kiếm theo vị trí' },
            { icon: 'filter', text: 'Lọc theo sở thích' },
            { icon: 'star', text: 'Xem đánh giá từ cộng đồng' },
        ],
    },
    {
        id: '2',
        title: 'Đặt chỗ dễ dàng',
        description: 'Đặt chỗ trước để có trải nghiệm tốt nhất, không cần chờ đợi khi đến quán.',
        image: 'https://images.unsplash.com/photo-1445116572660-236099ec97a0?q=80&w=2942&auto=format&fit=crop',
        features: [
            { icon: 'calendar-check', text: 'Chọn thời gian phù hợp' },
            { icon: 'seat', text: 'Chọn vị trí ưa thích' },
            { icon: 'bell', text: 'Nhận thông báo xác nhận' },
        ],
    },
    {
        id: '3',
        title: 'Check-in & Đánh giá',
        description: 'Chia sẻ trải nghiệm của bạn với cộng đồng thông qua hình ảnh và đánh giá.',
        image: 'https://images.unsplash.com/photo-1600093463592-8e36ae95ef56?q=80&w=2940&auto=format&fit=crop',
        features: [
            { icon: 'camera', text: 'Chụp ảnh check-in' },
            { icon: 'comment', text: 'Viết đánh giá' },
            { icon: 'share', text: 'Chia sẻ với bạn bè' },
        ],
    },
];

export default function OnboardingScreen({ navigation }) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const flatListRef = useRef(null);

    const markOnboardingComplete = async () => {
        try {
            await AsyncStorage.setItem('hasSeenOnboarding', 'true');
        } catch (error) {
            console.error('Error saving onboarding status:', error);
        }
    };

    const renderItem = ({ item, index }) => (
        <View style={styles.slide}>
            <Image source={{ uri: item.image }} style={styles.image} />
            <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.8)']}
                style={styles.gradient}
            >
                <View
                    style={styles.content}
                >
                    <Text style={styles.title}>{item.title}</Text>
                    <Text style={styles.description}>{item.description}</Text>

                    <View style={styles.features}>
                        {item.features.map((feature, idx) => (
                            <View
                                key={idx}
                                style={styles.featureItem}
                            >
                                <MaterialCommunityIcons name={feature.icon} size={24} color="white" />
                                <Text style={styles.featureText}>{feature.text}</Text>
                            </View>
                        ))}
                    </View>
                </View>
            </LinearGradient>
        </View>
    );

    const handleNext = async () => {
        if (currentIndex < ONBOARDING_DATA.length - 1) {
            flatListRef.current?.scrollToIndex({
                index: currentIndex + 1,
                animated: true,
            });
            setCurrentIndex(currentIndex + 1);
        } else {
            await markOnboardingComplete();
            navigation.replace('Login');
        }
    };

    const handleSkip = async () => {
        await markOnboardingComplete();
        navigation.replace('Login');
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Skip button at top-right corner */}
            <TouchableOpacity
                style={styles.topSkipButton}
                onPress={handleSkip}
            >
                <Text style={styles.skipButtonText}>Bỏ qua</Text>
            </TouchableOpacity>

            <FlatList
                ref={flatListRef}
                data={ONBOARDING_DATA}
                renderItem={renderItem}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onMomentumScrollEnd={(e) => {
                    const index = Math.round(e.nativeEvent.contentOffset.x / width);
                    setCurrentIndex(index);
                }}
            />

            <View style={styles.footer}>
                <TouchableOpacity
                    style={styles.nextButton}
                    onPress={handleNext}
                >
                    <Text style={styles.nextButtonText}>
                        {currentIndex === ONBOARDING_DATA.length - 1 ? 'Bắt đầu' : 'Tiếp tục'}
                    </Text>
                    <MaterialCommunityIcons
                        name={currentIndex === ONBOARDING_DATA.length - 1 ? 'check' : 'arrow-right'}
                        size={20}
                        color="white"
                    />
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'black',
    },
    slide: {
        width,
        height: '100%',
    },
    image: {
        width: '100%',
        height: '100%',
    },
    gradient: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        height: '70%',
        justifyContent: 'flex-end',
        padding: 20,
    },
    content: {
        gap: 16,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: 'white',
        textShadowColor: 'rgba(0, 0, 0, 0.75)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 3,
    },
    description: {
        fontSize: 16,
        color: 'rgba(255,255,255,0.9)',
        lineHeight: 24,
        textShadowColor: 'rgba(0, 0, 0, 0.75)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 3,
    },
    features: {
        marginTop: 24,
        gap: 16,
    },
    featureItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    featureText: {
        fontSize: 16,
        color: 'white',
        textShadowColor: 'rgba(0, 0, 0, 0.75)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 3,
    },
    buttons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    skipButton: {
        padding: 16,
    },
    skipButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '500',
    },
    nextButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#4A90E2',
        paddingHorizontal: 24,
        paddingVertical: 16,
        borderRadius: 24,
        gap: 8,
    },
    nextButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
    topSkipButton: {
        position: 'absolute',
        top: Platform.OS === 'ios' ? 50 : 20,
        right: 20,
        zIndex: 10,
        padding: 10,
        backgroundColor: 'rgba(0,0,0,0.3)',
        borderRadius: 16,
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 20,
        paddingBottom: Platform.OS === 'ios' ? 40 : 20,
        alignItems: 'flex-end',
    },
    nextButtonContainer: {
        alignItems: 'left',
    },

});
