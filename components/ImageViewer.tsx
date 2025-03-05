import { StyleSheet, Image } from "react-native";
// import { Image, type ImageSource } from 'expo-image';

type Props = {
  imgSource: any;
  selectedImage?: string;
};

export default function ImageViewer({ imgSource, selectedImage }: Props) {
  const imageSource = selectedImage ? { uri: selectedImage } : imgSource;

  return <Image source={imageSource} style={styles.image} />;
}

const styles = StyleSheet.create({
  image: {
    width: 120,
    height: 140,
    borderRadius: 100,
  },
});
