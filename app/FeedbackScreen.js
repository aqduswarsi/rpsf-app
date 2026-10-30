import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Modal,
  FlatList,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  MessageSquare,
  Star,
} from "lucide-react-native";
import {
  createUserFeedback,
  getMyFeedbacks,
  getUserProfile,
  updateMyFeedback,
} from "../lib/api";
import { COLORS, FONTS, SPACING, RADIUS } from "../constants/theme";

// ==========================================
// CONFIGURATION: FORM STRUCTURE
// ==========================================

const RATING_OPTIONS = [
  { label: "1", value: 1 },
  { label: "2", value: 2 },
  { label: "3", value: 3 },
  { label: "4", value: 4 },
  { label: "5", value: 5 },
  { label: "N/A", value: "N/A" },
];

const SECTIONS = [
  {
    key: "curriculum",
    title: "Part 2 — Curriculum & Training Material",
    questions: [
      {
        id: "c01",
        text: "Were the training objectives clearly explained at the beginning?",
      },
      {
        id: "c02",
        text: "Was the course aligned with the prescribed training programme?",
      },
      { id: "c03", text: "Was the content useful, relevant and up to date?" },
      { id: "c04", text: "Was study material provided on time?" },
      { id: "c05", text: "Was the sequence of topics easy to follow?" },
      {
        id: "c06",
        text: "Was there a suitable balance between theory and practical training?",
      },
      {
        id: "c07",
        text: "Were adequate examples, case studies and exercises provided?",
      },
      {
        id: "c08",
        text: "Was the course completed within the scheduled time?",
      },
      { id: "c09", text: "Were the learning objectives achieved?" },
      { id: "c10", text: "Did tests/assessment properly evaluate learning?" },
    ],
  },
  {
    key: "instructorRating",
    title: "Part 3 — Instructor / Guest Speaker",
    questions: [
      { id: "f01", text: "Instructor's subject knowledge and expertise" },
      { id: "f02", text: "Clarity of explanation" },
      { id: "f03", text: "Appropriate use of Hindi/English" },
      {
        id: "f04",
        text: "Use of examples, demonstrations and practical methods",
      },
      { id: "f05", text: "Opportunity to ask questions and resolve doubts" },
      { id: "f06", text: "Encouragement of trainee participation" },
      { id: "f07", text: "Punctuality and classroom management" },
      { id: "f08", text: "Respectful, fair and appropriate conduct" },
      { id: "f09", text: "Periodic assessment of trainee understanding" },
      { id: "f10", text: "Overall effectiveness of the instructor" },
    ],
  },
  {
    key: "classroom",
    title: "Part 5 — Classroom & Digital Facilities",
    questions: [
      { id: "i01", text: "Classroom cleanliness" },
      { id: "i02", text: "Seating arrangement and furniture" },
      { id: "i03", text: "Lighting, fans/coolers/AC and ventilation" },
      { id: "i04", text: "Whiteboard, digital podium, projector" },
      { id: "i05", text: "Audio system and microphone quality" },
      { id: "i06", text: "Availability of computer lab and internet" },
      { id: "i07", text: "Availability of practical equipment" },
      { id: "i08", text: "Learning environment and ability to concentrate" },
      { id: "i09", text: "Adherence to training schedule" },
      { id: "i10", text: "Access to training locations and signage" },
    ],
  },
  {
    key: "barrack",
    title: "Part 6 — Barrack & Accommodation",
    questions: [
      { id: "b01", text: "Adequacy of accommodation and room space" },
      { id: "b02", text: "Beds, mattresses and essential facilities" },
      { id: "b03", text: "Barrack cleanliness and maintenance" },
      { id: "b04", text: "Condition of bathrooms and toilets" },
      { id: "b05", text: "Availability of water" },
      { id: "b06", text: "Electricity, lighting and fans/coolers" },
      { id: "b07", text: "Drainage and wastewater disposal" },
      { id: "b08", text: "Mosquito/pest control and hygienic environment" },
      { id: "b09", text: "Night-time security and assistance" },
      { id: "b10", text: "Action on maintenance requests/complaints" },
    ],
  },
  {
    key: "food",
    title: "Part 7 — Food & Mess",
    questions: [
      { id: "m01", text: "Food quality and taste" },
      { id: "m02", text: "Nutritional value and variety" },
      { id: "m03", text: "Availability of meals at scheduled times" },
      { id: "m04", text: "Quality and availability of drinking water" },
      { id: "m05", text: "Cleanliness of mess, kitchen and utensils" },
      { id: "m06", text: "Food serving arrangements" },
      { id: "m07", text: "Quantity and adequacy of food" },
      { id: "m08", text: "Action on food-related complaints" },
    ],
  },
  {
    key: "hygiene",
    title: "Part 8 — Hygiene & General Facilities",
    questions: [
      { id: "h01", text: "Availability and condition of toilets" },
      { id: "h02", text: "Bathing facilities, water and privacy" },
      { id: "h03", text: "Waste disposal and campus cleanliness" },
      { id: "h04", text: "First aid and medical assistance" },
      { id: "h05", text: "Assistance during illness/emergency" },
      { id: "h06", text: "Sports ground, PT ground and gym facilities" },
      { id: "h07", text: "Library and study materials" },
      { id: "h08", text: "Laundry/drying facilities, where applicable" },
      { id: "h09", text: "Rest and emergency support arrangements" },
    ],
  },
  {
    key: "online",
    title: "Part 9 — Online Training",
    questions: [
      { id: "o01", text: "Was login/registration easy?" },
      { id: "o02", text: "Was the online platform easy to access?" },
      { id: "o03", text: "How was audio and video quality?" },
      {
        id: "o04",
        text: "Were the instructor's voice and on-screen content clear?",
      },
      { id: "o05", text: "Were screen sharing and presentations useful?" },
      { id: "o06", text: "How often did internet/connectivity issues occur?" },
      { id: "o07", text: "Were chat, polls and Q&A features useful?" },
      { id: "o08", text: "Were recordings/learning materials available?" },
      { id: "o09", text: "Was the online test/assignment process easy?" },
      { id: "o10", text: "Was technical support available when needed?" },
      { id: "o11", text: "Was the subject easy to understand online?" },
      {
        id: "o12",
        text: "Would you recommend online training for this subject?",
      },
    ],
  },
  {
    key: "physical",
    title: "Part 10 — Physical, Weapon & Security Training",
    questions: [
      { id: "p01", text: "Was a safety briefing given before practice?" },
      { id: "p02", text: "Was the instructor's demonstration clear?" },
      { id: "p03", text: "Were required equipment and materials available?" },
      { id: "p04", text: "Did each trainee receive adequate practice?" },
      { id: "p05", text: "Was practice conducted as scheduled?" },
      { id: "p06", text: "Were supervision and safety arrangements adequate?" },
      { id: "p07", text: "Were mistakes explained and corrected?" },
      { id: "p08", text: "Did practice improve confidence/skills?" },
      { id: "p09", text: "Were weather, ground and training site suitable?" },
      {
        id: "p10",
        text: "Was there any unsafe situation or equipment shortage?",
      },
    ],
  },
  {
    key: "women",
    title: "Part 11 — Women Trainees' Facilities & Dignity",
    questions: [
      { id: "w01", text: "Is safe and suitable accommodation available?" },
      {
        id: "w02",
        text: "Is adequate privacy available in barracks/bathrooms?",
      },
      { id: "w03", text: "Are doors, curtains, locks and lighting adequate?" },
      {
        id: "w04",
        text: "Can female instructors/staff be contacted when needed?",
      },
      { id: "w05", text: "Is it easy to contact the female warden/officer?" },
      {
        id: "w06",
        text: "Are health, hygiene and personal-needs facilities adequate?",
      },
      {
        id: "w07",
        text: "Is a safe and confidential complaint channel available?",
      },
      { id: "w08", text: "Are support procedures known for safety concerns?" },
      {
        id: "w09",
        text: "Are respect, fairness and equal opportunities provided?",
      },
      {
        id: "w10",
        text: "Are improvements needed in accommodation/hygiene/safety?",
      },
    ],
  },
  {
    key: "discipline",
    title: "Part 12 — Discipline, Welfare & Administrative Support",
    questions: [
      { id: "a01", text: "Was training conducted according to schedule?" },
      { id: "a02", text: "Were attendance, leave and training rules clear?" },
      { id: "a03", text: "Were trainees treated fairly and respectfully?" },
      {
        id: "a04",
        text: "Was information about the concerned officer available?",
      },
      { id: "a05", text: "Was it easy to submit a complaint/suggestion?" },
      { id: "a06", text: "Were requests/complaints addressed in time?" },
      { id: "a07", text: "Were medical/emergency support arrangements clear?" },
      {
        id: "a08",
        text: "Were adequate rest and essential facilities provided?",
      },
      {
        id: "a09",
        text: "Was there confidence in protection from discrimination?",
      },
      { id: "a10", text: "Was overall administrative support satisfactory?" },
    ],
  },
  {
    key: "learning",
    title: "Part 13 — Learning Outcomes",
    questions: [
      { id: "l01", text: "How much did subject knowledge improve?" },
      { id: "l02", text: "Can you perform the learned task independently?" },
      { id: "l03", text: "Did problem-solving ability improve?" },
      { id: "l04", text: "Will the learning be useful in actual duty/work?" },
      { id: "l05", text: "Did confidence improve after training?" },
      {
        id: "l06",
        text: "Was test/practical assessment aligned with objectives?",
      },
      { id: "l07", text: "Was guidance provided to improve weaknesses?" },
    ],
  },
];

const PART_1_FIELDS = [
  {
    key: "courseMode",
    label: "Course Mode",
    options: [
      "Online",
      "On-Campus",
      "Hybrid",
      "Guest Lecture",
      "Practical",
      "Specialised",
    ],
  },
  {
    key: "courseCategory",
    label: "Course Category",
    options: ["Basic", "Advanced", "Refresher", "Promotional", "Specialised"],
  },
  {
    key: "courseStatus",
    label: "Course Status",
    options: ["Completed", "Ongoing", "Dropped"],
  },
  {
    key: "feedbackStage",
    label: "Feedback Stage",
    options: ["Mid-Course", "End-Course", "Post-Training"],
  },
  { key: "language", label: "Language", options: ["Hindi", "English", "Both"] },
];

// ==========================================
// MAIN COMPONENT
// ==========================================

export default function FeedbackScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [feedbacks, setFeedbacks] = useState([]);
  const [activeTab, setActiveTab] = useState("new");
  const [editingId, setEditingId] = useState(null); // 👈 Edit state

  const [currentStep, setCurrentStep] = useState(0);

  const [formData, setFormData] = useState({
    courseMode: "",
    courseCategory: "",
    courseName: "",
    batch: "",
    instructor: "",
    feedbackStage: "",
    courseStatus: "",
    language: "",
    traineeName: "",
    traineeId: "",
    railwayZone: "",
    overallCourseRating: "",
    mostUsefulAspect: "",
    areasRequiringImprovement: "",
    otherSuggestions: "",
    wouldRecommend: "",
  });

  const [ratings, setRatings] = useState({});
  const [dropdownModal, setDropdownModal] = useState({
    visible: false,
    key: "",
    options: [],
  });

  const loadFeedbacks = async () => {
    try {
      const [profile, data] = await Promise.all([
        getUserProfile(),
        getMyFeedbacks(),
      ]);
      setFormData((prev) => ({
        ...prev,
        traineeName: profile.nameEnglish || "",
        traineeId: profile.rollNumber || "",
        railwayZone: profile.zone || "",
      }));
      setFeedbacks(data);
    } catch (err) {
      console.log("Error loading feedbacks:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFeedbacks();
  }, []);

  const handleTextChange = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleRatingChange = (sectionKey, qId, value) => {
    setRatings((prev) => ({
      ...prev,
      [sectionKey]: {
        ...(prev[sectionKey] || {}),
        [qId]: value,
      },
    }));
  };

  const handleSubmit = async () => {
    if (!formData.courseName) {
      setCurrentStep(0);
      return Alert.alert("Required", "Please enter the Course / Subject Name.");
    }

    try {
      setSubmitting(true);
      const payload = { ...formData, ...ratings };

      if (editingId) {
        // 👈 Update Logic
        await updateMyFeedback(editingId, payload);
        Alert.alert("Success", "Feedback updated successfully!");
      } else {
        // 👈 Create Logic
        await createUserFeedback(payload);
        Alert.alert("Success", "Training Feedback submitted successfully!");
      }

      // Reset form
      setCurrentStep(0);
      setEditingId(null);
      setFormData((prev) => ({
        ...prev,
        courseName: "",
        batch: "",
        instructor: "",
        overallCourseRating: "",
        mostUsefulAspect: "",
        areasRequiringImprovement: "",
        otherSuggestions: "",
      }));
      setRatings({});
      setActiveTab("history");
      loadFeedbacks();
    } catch (err) {
      Alert.alert("Error", err.message || "Failed to submit feedback.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.blue} />
      </View>
    );
  }

  const renderDropdown = (field) => (
    <TouchableOpacity
      style={styles.dropdownInput}
      onPress={() =>
        setDropdownModal({
          visible: true,
          key: field.key,
          options: field.options,
        })
      }
    >
      <Text
        style={
          formData[field.key] ? styles.dropdownText : styles.dropdownPlaceholder
        }
      >
        {formData[field.key] || `Select ${field.label}`}
      </Text>
    </TouchableOpacity>
  );

  const renderStep0 = () => (
    <View style={styles.card}>
      <Text style={styles.sectionTitle}>
        Part 1 — Training & Trainee Details
      </Text>
      {PART_1_FIELDS.slice(0, 2).map((f) => (
        <View key={f.key} style={styles.inputGroup}>
          <Text style={styles.label}>{f.label}</Text>
          {renderDropdown(f)}
        </View>
      ))}

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Course / Subject Name *</Text>
        <TextInput
          style={styles.textInput}
          value={formData.courseName}
          onChangeText={(v) => handleTextChange("courseName", v)}
          placeholder="Enter course name"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Batch / Course ID</Text>
        <TextInput
          style={styles.textInput}
          value={formData.batch}
          onChangeText={(v) => handleTextChange("batch", v)}
          placeholder="Enter batch ID"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Instructor / Guest Speaker</Text>
        <TextInput
          style={styles.textInput}
          value={formData.instructor}
          onChangeText={(v) => handleTextChange("instructor", v)}
          placeholder="Enter instructor name"
        />
      </View>

      {PART_1_FIELDS.slice(2).map((f) => (
        <View key={f.key} style={styles.inputGroup}>
          <Text style={styles.label}>{f.label}</Text>
          {renderDropdown(f)}
        </View>
      ))}
    </View>
  );

  const renderRatingSection = (section) => (
    <View style={styles.card}>
      <Text style={styles.sectionTitle}>{section.title}</Text>
      {section.questions.map((q, idx) => (
        <View key={q.id} style={styles.questionWrap}>
          <Text style={styles.qText}>
            {idx + 1}. {q.text}
          </Text>
          <View style={styles.optionsRow}>
            {RATING_OPTIONS.map((opt) => {
              const isSelected = ratings[section.key]?.[q.id] === opt.value;
              return (
                <TouchableOpacity
                  key={opt.label}
                  style={[
                    styles.ratingBtn,
                    isSelected && styles.ratingBtnSelected,
                  ]}
                  onPress={() =>
                    handleRatingChange(section.key, q.id, opt.value)
                  }
                >
                  <Text
                    style={[
                      styles.ratingText,
                      isSelected && styles.ratingTextSelected,
                    ]}
                  >
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      ))}
    </View>
  );

  const renderOverall = () => (
    <View style={styles.card}>
      <Text style={styles.sectionTitle}>
        Part 14 — Overall Feedback & Suggestions
      </Text>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Overall Course Rating (1-5)</Text>
        {renderDropdown({
          key: "overallCourseRating",
          label: "Rating",
          options: ["1", "2", "3", "4", "5"],
        })}
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Would you recommend this course?</Text>
        {renderDropdown({
          key: "wouldRecommend",
          label: "Recommendation",
          options: ["Yes", "No", "Maybe"],
        })}
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Most useful aspect of the training</Text>
        <TextInput
          style={[styles.textInput, { height: 80 }]}
          multiline
          value={formData.mostUsefulAspect}
          onChangeText={(v) => handleTextChange("mostUsefulAspect", v)}
          placeholder="Write here..."
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Areas requiring improvement</Text>
        <TextInput
          style={[styles.textInput, { height: 80 }]}
          multiline
          value={formData.areasRequiringImprovement}
          onChangeText={(v) => handleTextChange("areasRequiringImprovement", v)}
          placeholder="Write here..."
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Other valuable suggestions</Text>
        <TextInput
          style={[styles.textInput, { height: 80 }]}
          multiline
          value={formData.otherSuggestions}
          onChangeText={(v) => handleTextChange("otherSuggestions", v)}
          placeholder="Write here..."
        />
      </View>
    </View>
  );

  const renderHistory = () => (
    <View>
      {feedbacks.length === 0 ? (
        <View style={styles.emptyBox}>
          <MessageSquare color={COLORS.muted} size={48} />
          <Text style={styles.emptyText}>No feedbacks submitted yet.</Text>
        </View>
      ) : (
        feedbacks.map((item) => (
          <View key={item._id} style={styles.feedbackCard}>
            <View style={styles.feedbackHeader}>
              <Text style={styles.feedbackTitle}>
                {item.courseName || "Training Feedback"}
              </Text>
              <View style={styles.avgBadge}>
                <Star color="#F59E0B" fill="#F59E0B" size={12} />
                <Text style={styles.avgText}>
                  {item.averageRating || 0} / 5
                </Text>
              </View>
            </View>

            <Text style={styles.dateText}>
              {new Date(item.createdAt).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </Text>

            {item.mostUsefulAspect && (
              <Text style={styles.feedbackText}>
                <Text style={{ fontFamily: FONTS.semiBold }}>Useful: </Text>
                {item.mostUsefulAspect}
              </Text>
            )}

            <View style={styles.actionRow}>
              <TouchableOpacity
                style={[styles.actionBtn, { borderColor: COLORS.blue }]}
                onPress={() => {
                  setFormData({
                    courseMode: item.courseMode || "",
                    courseCategory: item.courseCategory || "",
                    courseName: item.courseName || "",
                    batch: item.batch || "",
                    instructor: item.instructor || "",
                    feedbackStage: item.feedbackStage || "",
                    courseStatus: item.courseStatus || "",
                    language: item.language || "",
                    traineeName: item.traineeName || "",
                    traineeId: item.traineeId || "",
                    railwayZone: item.railwayZone || "",
                    overallCourseRating: item.overallCourseRating || "",
                    mostUsefulAspect: item.mostUsefulAspect || "",
                    areasRequiringImprovement:
                      item.areasRequiringImprovement || "",
                    otherSuggestions: item.otherSuggestions || "",
                    wouldRecommend: item.wouldRecommend || "",
                  });

                  const newRatings = {};
                  SECTIONS.forEach((sec) => {
                    if (item[sec.key]) newRatings[sec.key] = item[sec.key];
                  });
                  setRatings(newRatings);

                  setEditingId(item._id);
                  setActiveTab("new");
                  setCurrentStep(0);
                }}
              >
                <Text
                  style={{
                    color: COLORS.blue,
                    fontFamily: FONTS.medium,
                    fontSize: 12,
                  }}
                >
                  Edit
                </Text>
              </TouchableOpacity>
            </View>

            {(item.adminReviewed ||
              item.adminStatus ||
              item.resolutionRemarks) && (
              <View style={styles.adminFeedbackBox}>
                <Text style={styles.adminFeedbackTitle}>Admin Response</Text>
                {item.adminStatus && (
                  <View style={styles.statusRow}>
                    <Text style={styles.adminLabel}>Status: </Text>
                    <Text
                      style={[
                        styles.adminValue,
                        {
                          color:
                            item.adminStatus === "Resolved"
                              ? "#16A34A"
                              : "#D97706",
                          fontFamily: FONTS.semiBold,
                        },
                      ]}
                    >
                      {item.adminStatus}
                    </Text>
                  </View>
                )}
                {item.actionTaken && (
                  <Text style={styles.adminText}>
                    <Text style={styles.adminLabel}>Action Taken: </Text>
                    {item.actionTaken}
                  </Text>
                )}
                {item.resolutionRemarks && (
                  <Text style={styles.adminText}>
                    <Text style={styles.adminLabel}>Remarks: </Text>
                    {item.resolutionRemarks}
                  </Text>
                )}
              </View>
            )}
          </View>
        ))
      )}
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: COLORS.mist }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
        >
          <ChevronLeft color={COLORS.navy} size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {editingId ? "Edit Feedback" : "Training Feedback"}
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "new" && styles.tabActive]}
          onPress={() => {
            setEditingId(null); // Reset edit mode
            setActiveTab("new");
          }}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "new" && styles.tabTextActive,
            ]}
          >
            New Feedback
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === "history" && styles.tabActive]}
          onPress={() => setActiveTab("history")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "history" && styles.tabTextActive,
            ]}
          >
            My Submissions ({feedbacks.length})
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        {activeTab === "history" ? (
          renderHistory()
        ) : (
          <>
            {currentStep === 0 && renderStep0()}
            {currentStep > 0 &&
              currentStep <= SECTIONS.length &&
              renderRatingSection(SECTIONS[currentStep - 1])}
            {currentStep > SECTIONS.length && renderOverall()}
          </>
        )}
      </ScrollView>

      {activeTab === "new" && (
        <View style={[styles.footer, { paddingBottom: insets.bottom + 10 }]}>
          {currentStep > 0 && (
            <TouchableOpacity
              style={styles.navBtnOutline}
              onPress={() => setCurrentStep((prev) => prev - 1)}
            >
              <ChevronLeft color={COLORS.blue} size={20} />
              <Text style={styles.navBtnTextOutline}>Back</Text>
            </TouchableOpacity>
          )}

          <View style={{ flex: 1 }} />

          {currentStep < SECTIONS.length + 1 ? (
            <TouchableOpacity
              style={styles.navBtn}
              onPress={() => setCurrentStep((prev) => prev + 1)}
            >
              <Text style={styles.navBtnText}>Next</Text>
              <ChevronRight color={COLORS.surface} size={20} />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.navBtn, { backgroundColor: "#16A34A" }]}
              onPress={handleSubmit}
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator color={COLORS.surface} />
              ) : (
                <>
                  <CheckCircle color={COLORS.surface} size={20} />
                  <Text style={styles.navBtnText}>
                    {editingId ? "Update" : "Submit"}
                  </Text>
                </>
              )}
            </TouchableOpacity>
          )}
        </View>
      )}

      <Modal visible={dropdownModal.visible} transparent animationType="fade">
        <TouchableOpacity
          style={styles.modalBg}
          activeOpacity={1}
          onPress={() => setDropdownModal({ visible: false })}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Option</Text>
            <FlatList
              data={dropdownModal.options}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.modalItem}
                  onPress={() => {
                    handleTextChange(dropdownModal.key, item);
                    setDropdownModal({ visible: false });
                  }}
                >
                  <Text style={styles.modalItemText}>{item}</Text>
                  {formData[dropdownModal.key] === item && (
                    <CheckCircle color={COLORS.blue} size={20} />
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.mist,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.md,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.line,
  },
  backBtn: { padding: SPACING.xs },
  headerTitle: { fontFamily: FONTS.semiBold, fontSize: 18, color: COLORS.navy },

  tabContainer: {
    flexDirection: "row",
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.line,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  tabActive: { borderBottomColor: COLORS.blue },
  tabText: { fontFamily: FONTS.medium, fontSize: 14, color: COLORS.muted },
  tabTextActive: { color: COLORS.blue, fontFamily: FONTS.semiBold },

  content: { padding: SPACING.md, paddingBottom: 100 },

  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.card,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.line,
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontFamily: FONTS.semiBold,
    fontSize: 16,
    color: COLORS.navy,
    marginBottom: SPACING.md,
  },

  inputGroup: { marginBottom: SPACING.md },
  label: {
    fontFamily: FONTS.medium,
    fontSize: 13,
    color: COLORS.ink,
    marginBottom: 6,
  },
  textInput: {
    backgroundColor: COLORS.mist,
    borderWidth: 1,
    borderColor: COLORS.line,
    borderRadius: RADIUS.input,
    paddingHorizontal: SPACING.md,
    paddingVertical: 10,
    fontFamily: FONTS.regular,
    fontSize: 14,
    color: COLORS.ink,
  },
  dropdownInput: {
    backgroundColor: COLORS.mist,
    borderWidth: 1,
    borderColor: COLORS.line,
    borderRadius: RADIUS.input,
    paddingHorizontal: SPACING.md,
    paddingVertical: 12,
  },
  dropdownText: { fontFamily: FONTS.regular, fontSize: 14, color: COLORS.ink },
  dropdownPlaceholder: {
    fontFamily: FONTS.regular,
    fontSize: 14,
    color: COLORS.muted,
  },

  questionWrap: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  qText: {
    fontFamily: FONTS.medium,
    fontSize: 14,
    color: COLORS.ink,
    marginBottom: 10,
    lineHeight: 20,
  },
  optionsRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  ratingBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.line,
    backgroundColor: COLORS.mist,
  },
  ratingBtnSelected: { backgroundColor: COLORS.blue, borderColor: COLORS.blue },
  ratingText: { fontFamily: FONTS.medium, fontSize: 13, color: COLORS.ink },
  ratingTextSelected: { color: COLORS.surface },

  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    padding: SPACING.md,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.line,
  },
  navBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.blue,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: RADIUS.button,
    gap: 6,
  },
  navBtnText: {
    fontFamily: FONTS.semiBold,
    fontSize: 15,
    color: COLORS.surface,
  },
  navBtnOutline: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: RADIUS.button,
    gap: 4,
  },
  navBtnTextOutline: {
    fontFamily: FONTS.semiBold,
    fontSize: 15,
    color: COLORS.blue,
  },

  emptyBox: { alignItems: "center", opacity: 0.5, marginTop: 40 },
  emptyText: { fontFamily: FONTS.regular, fontSize: 14, marginTop: 10 },

  feedbackCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.card,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.line,
  },
  feedbackHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  feedbackTitle: {
    fontFamily: FONTS.semiBold,
    fontSize: 15,
    color: COLORS.navy,
  },
  avgBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#FEF3C7",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  avgText: { fontFamily: FONTS.semiBold, fontSize: 12, color: "#92400E" },
  dateText: {
    fontFamily: FONTS.regular,
    fontSize: 12,
    color: COLORS.muted,
    marginBottom: 8,
  },
  feedbackText: {
    fontFamily: FONTS.regular,
    fontSize: 13,
    color: COLORS.ink,
    lineHeight: 18,
  },

  actionRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
    paddingTop: 12,
  },
  actionBtn: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },

  modalBg: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    padding: SPACING.lg,
  },
  modalContent: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.card,
    maxHeight: "70%",
    padding: SPACING.md,
  },
  modalTitle: {
    fontFamily: FONTS.semiBold,
    fontSize: 18,
    color: COLORS.navy,
    marginBottom: SPACING.md,
    textAlign: "center",
  },
  modalItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.line,
  },
  modalItemText: { fontFamily: FONTS.regular, fontSize: 15, color: COLORS.ink },

  adminFeedbackBox: {
    backgroundColor: "#EFF6FF",
    borderRadius: 8,
    padding: 12,
    marginTop: 12,
    borderWidth: 1,
    borderColor: "#BFDBFE",
  },
  adminFeedbackTitle: {
    fontFamily: FONTS.semiBold,
    fontSize: 13,
    color: COLORS.navy,
    marginBottom: 6,
  },
  statusRow: { flexDirection: "row", alignItems: "center", marginBottom: 4 },
  adminLabel: { fontFamily: FONTS.medium, fontSize: 12, color: COLORS.muted },
  adminValue: { fontSize: 12 },
  adminText: {
    fontFamily: FONTS.regular,
    fontSize: 12,
    color: COLORS.ink,
    lineHeight: 18,
    marginTop: 4,
  },
});
