import React from "react";
import {View, Text, TextInput, StyleSheet} from "react-native";
import FormPicker from "../../../components/common/FormPicker";
import colors from "../../../styles/colors";

const SearchAndFilterBar = ({
  searchValue,
  onSearchChange,
  filterValue,
  onFilterChange,
  filterOptions = [],
  placeholder = "Tìm kiếm...",
  filterLabel = "Lọc theo:",
  searchLabel = "Tìm theo tên:",
  direction = "row",
  style,
}) => {
  return (
    <View style={[styles.container, {flexDirection: direction}, style]}>
      <View style={styles.block}>
        <Text style={styles.label}>{searchLabel}</Text>
        <TextInput
          style={styles.input}
          value={searchValue}
          onChangeText={onSearchChange}
          placeholder={placeholder}
          placeholderTextColor="#888"
          returnKeyType="search"
          underlineColorAndroid="transparent"
          textAlign="left"
        />
      </View>
      <View style={styles.block}>
        <Text style={styles.label}>{filterLabel}</Text>
        <View style={styles.pickerWrapper}>
          <FormPicker
            hideLabel
            containerStyle={{marginBottom: 0}}
            value={filterValue}
            onValueChange={onFilterChange}
            options={filterOptions}
            style={styles.picker}
            textStyle={styles.pickerText}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "flex-start",
    gap: 12,
    marginBottom: 16,
    marginHorizontal: 16,
    width: "auto",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 12,
    shadowColor: "#000",
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 2,
    minWidth: 0,
    maxWidth: 600,
    alignSelf: "center",
  },
  block: {
    flex: 1,
    minWidth: 0,
    width: "100%",
    alignItems: "stretch",
    justifyContent: "center",
  },
  label: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: "600",
    marginBottom: 4,
    textAlign: "center",
    width: "100%",
  },
  input: {
    borderWidth: 1.5,
    borderColor: colors.primary,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
    fontSize: 16,
    backgroundColor: "#f9f9f9",
    color: colors.text,
    height: 44,
    textAlign: "left",
    width: "100%",
  },
  pickerWrapper: {
    width: "100%",
    height: 44,
    overflow: "hidden",
    justifyContent: "center",
  },
  picker: {
    borderRadius: 10,
    height: 44,
    backgroundColor: "#f9f9f9",
    borderWidth: 1.5,
    borderColor: colors.primary,
    justifyContent: "center",
    width: "100%",
    minWidth: 0,
    overflow: "hidden",
  },
  pickerText: {
    fontSize: 15,
    color: colors.text,
    maxWidth: 120,
    overflow: "hidden",
    numberOfLines: 1,
    ellipsizeMode: "tail",
  },
});

export default SearchAndFilterBar;
