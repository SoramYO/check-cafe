import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function StepIndicator({ currentStep, totalSteps }) {
  return (
    <View style={styles.stepIndicator}>
      {Array.from({ length: totalSteps }).map((_, index) => (
        <React.Fragment key={index}>
          <View style={[styles.step, currentStep >= index + 1 && styles.stepActive]}>
            <Text style={[styles.stepText, currentStep >= index + 1 && styles.stepTextActive]}>
              {index + 1}
            </Text>
          </View>
          {index < totalSteps - 1 && (
            <View style={[styles.stepLine, currentStep > index + 1 && styles.stepLineActive]} />
          )}
        </React.Fragment>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  stepIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  step: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#E2E8F0",
    justifyContent: "center",
    alignItems: "center",
  },
  stepActive: {
    backgroundColor: "#7a5545",
  },
  stepLine: {
    width: 24,
    height: 2,
    backgroundColor: "#E2E8F0",
  },
  stepLineActive: {
    backgroundColor: "#7a5545",
  },
  stepText: {
    color: "#7a5545",
    fontSize: 14,
    fontWeight: "500",
  },
  stepTextActive: {
    color: "white",
  },
});