import {
    View,
    TextInputProps,
    TextInput,
    StyleSheet,
} from "react-native";

import FontAwesome from "@expo/vector-icons/FontAwesome";

interface SearchInputParams extends TextInputProps {}

export function SearchInput({ style, ...props }: SearchInputParams) {
    return (
        <View style={styles.searchSection}>
            <FontAwesome name="search" size={24} color={"black"} style={styles.searchIcon} />
            <TextInput style={styles.input} {...props}></TextInput>
        </View>
    );
}

const styles = StyleSheet.create({
    searchSection: {
        flexDirection: 'row',
        alignItems: "center",
        backgroundColor: "#F8F9FE",
        borderRadius: 8,
        paddingHorizontal: 4,
        paddingVertical: 8
    },
    searchIcon: {
        padding: 8
    },
    input: {
        flex: 1
    }
});
