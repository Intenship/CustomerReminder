// screens/SignUpScreen.tsx
import React, { useState } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebaseConfig";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types";

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, "SignUp">;
};

export default function SignUpScreen({ navigation }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    // Reset error
    setError("");

    // Check if all fields are filled
    if (!fullName || !email || !password || !confirmPassword) {
      setError("Please fill in all fields.");
      return false;
    }

    // Validate full name
    if (fullName.trim().length < 2) {
      setError("Please enter your full name (at least 2 characters).");
      return false;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address.");
      return false;
    }

    // Validate password strength
    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return false;
    }

    // Check if passwords match
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return false;
    }

    return true;
  };

  const handleSignUp = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      await createUserWithEmailAndPassword(auth, email, password);
      navigation.replace("Home");
    } catch (err: any) {
      let errorMessage = "Sign up failed. Please try again.";
      
      // Handle specific Firebase error codes
      switch (err.code) {
        case "auth/email-already-in-use":
          errorMessage = "An account with this email already exists.";
          break;
        case "auth/weak-password":
          errorMessage = "Password is too weak. Please choose a stronger password.";
          break;
        case "auth/invalid-email":
          errorMessage = "Please enter a valid email address.";
          break;
        case "auth/operation-not-allowed":
          errorMessage = "Email/password accounts are not enabled.";
          break;
        default:
          errorMessage = err.message || errorMessage;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerContainer}>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join us to get started</Text>
        </View>

        <View style={styles.formContainer}>
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Full Name</Text>
            <TextInput
              placeholder="Enter your full name"
              value={fullName}
              onChangeText={setFullName}
              style={[styles.input, error && styles.inputError]}
              autoCorrect={false}
              autoComplete="name"
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Email</Text>
            <TextInput
              placeholder="Enter your email"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              style={[styles.input, error && styles.inputError]}
              autoCorrect={false}
              autoComplete="email"
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Password</Text>
            <TextInput
              placeholder="Create a password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              style={[styles.input, error && styles.inputError]}
              autoComplete="password-new"
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Confirm Password</Text>
            <TextInput
              placeholder="Confirm your password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              style={[styles.input, error && styles.inputError]}
              autoComplete="password-new"
              placeholderTextColor="#999"
            />
          </View>

          {error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <View style={styles.passwordRequirements}>
            <Text style={styles.requirementsTitle}>Password requirements:</Text>
            <Text style={[
              styles.requirementText,
              password.length >= 6 ? styles.requirementMet : styles.requirementNotMet
            ]}>
              • At least 6 characters
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.signUpButton, loading && styles.signUpButtonDisabled]}
            onPress={handleSignUp}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.signUpButtonText}>Create Account</Text>
            )}
          </TouchableOpacity>

          <View style={styles.dividerContainer}>
            <View style={styles.divider} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.divider} />
          </View>

          <TouchableOpacity
            style={styles.loginButton}
            onPress={() => navigation.replace("Login")}
            disabled={loading}
          >
            <Text style={styles.loginButtonText}>
              Already have an account? <Text style={styles.loginButtonTextBold}>Sign In</Text>
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.termsContainer}>
          <Text style={styles.termsText}>
            By creating an account, you agree to our{" "}
            <Text style={styles.termsLink}>Terms of Service</Text> and{" "}
            <Text style={styles.termsLink}>Privacy Policy</Text>
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 20,
  },
  headerContainer: {
    alignItems: "center",
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#1a1a1a",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
  formContainer: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1.5,
    borderColor: "#e1e5e9",
    padding: 16,
    borderRadius: 8,
    fontSize: 16,
    backgroundColor: "#fff",
    color: "#333",
  },
  inputError: {
    borderColor: "#ff4757",
  },
  errorContainer: {
    backgroundColor: "#ffe6e6",
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#ffcccc",
  },
  errorText: {
    color: "#d32f2f",
    fontSize: 14,
    textAlign: "center",
    fontWeight: "500",
  },
  passwordRequirements: {
    backgroundColor: "#f8f9fa",
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  requirementsTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  requirementText: {
    fontSize: 12,
    marginBottom: 2,
  },
  requirementMet: {
    color: "#28a745",
  },
  requirementNotMet: {
    color: "#666",
  },
  signUpButton: {
    backgroundColor: "#28a745",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 20,
    shadowColor: "#28a745",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  signUpButtonDisabled: {
    backgroundColor: "#ccc",
    shadowOpacity: 0,
    elevation: 0,
  },
  signUpButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: "#e1e5e9",
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
    color: "#666",
  },
  loginButton: {
    alignItems: "center",
    padding: 12,
  },
  loginButtonText: {
    fontSize: 16,
    color: "#666",
  },
  loginButtonTextBold: {
    fontWeight: "bold",
    color: "#007bff",
  },
  termsContainer: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  termsText: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
    lineHeight: 18,
  },
  termsLink: {
    color: "#007bff",
    fontWeight: "500",
  },
});