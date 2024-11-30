import React, { useState } from "react";
import { View, Image, StyleSheet, TouchableOpacity, Text } from "react-native";

const CustomCarousel = ({ images }) => {
	const [currentIndex, setCurrentIndex] = useState(0);

	const handleNext = () => {
		if (currentIndex < images.length - 1) {
			setCurrentIndex(currentIndex + 1);
		}
	};
 
	const handlePrev = () => {
		if (currentIndex > 0) {
			setCurrentIndex(currentIndex - 1);
		}
	};

	return (
		<View style={styles.carouselContainer}>
			<Image
				source={images[currentIndex]}
				style={styles.carouselImage}
				resizeMode="stretch"
			/>
			<View style={styles.carouselControls}>
				<TouchableOpacity onPress={handlePrev} disabled={currentIndex === 0}>
					<Text style={styles.controlText}>{"<"} Prev</Text>
				</TouchableOpacity>
				<TouchableOpacity
					onPress={handleNext}
					disabled={currentIndex === images.length - 1}
				>
					<Text style={styles.controlText}>Next {">"}</Text>
				</TouchableOpacity>
			</View>
		</View>
	);
};

const styles = StyleSheet.create({
	carouselContainer: {
		alignItems: "center",
		marginVertical: 20,
		flex: 1,
		width: "100%",
	},
	carouselImage: {
		resizeMode: "stretch",
		width: "80%",
		height: "80%",
		borderRadius: 10,
	},
	carouselControls: {
		flexDirection: "row",
		justifyContent: "space-between",
		width: "100%",
		marginTop: 10,
	},
	controlText: {
		fontSize: 16,
		color: "#0B0C63",
	},
});

export default CustomCarousel;