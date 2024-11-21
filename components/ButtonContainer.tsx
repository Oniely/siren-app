import { StyleSheet, Text, View, Image, Pressable } from 'react-native'
import React from 'react'

const ButtonContainer = () => {
  return (
		<View style={styles.buttonContainer}>
			<View style={styles.buttons}>
				<Pressable>
					<Image
						source={require("../assets/woman.png")}
						style={[
							styles.icon,
							{
								marginBottom: 30,
							},
						]}
					/>
				</Pressable>
				<View style={styles.middleIcons}>
					<Pressable>
						<Image
							source={require("../assets/telephone.png")}
							style={[
								styles.icon,
								{
									marginBottom: 30,
								},
							]}
						/>
					</Pressable>
					<Pressable>
						<Image
							source={require("../assets/plus.png")}
							style={[
								styles.icon,
								{
									marginBottom: 30,
									resizeMode: "stretch",
									width: 40,
									height: 40,
								},
							]}
						/>
					</Pressable>
					<Pressable>
						<Image
							source={require("../assets/police-badge.png")}
							style={[
								styles.icon,
								{
									marginBottom: 30,
								},
							]}
						/>
					</Pressable>
				</View>
				<Pressable>
					<Image source={require("../assets/profile.png")} />
				</Pressable>
			</View>
		</View>
	);
}

export default ButtonContainer

const styles = StyleSheet.create({
	buttonContainer: {
		flex: 1,
		width: "100%",
		justifyContent: "center",
		alignItems: "center",
		paddingVertical: 10,
	},
	buttons: {
		justifyContent: "center",
		alignItems: "center",
	},
	middleIcons: {
		flexDirection: "row",
		justifyContent: "center",
		alignItems: "center",
		gap: 40,
	},
	icon: {

	},
});