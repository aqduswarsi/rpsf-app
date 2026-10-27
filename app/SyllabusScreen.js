import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
  LayoutAnimation,
  Platform,
  UIManager,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  BookOpen,
  ChevronDown,
  ChevronUp,
  FileText,
  FolderOpen,
  Download,
} from "lucide-react-native";
import { getCourses, getSubjects, getLessons } from "../lib/api";
import { COLORS, FONTS, SPACING, RADIUS } from "../constants/theme";

// Android me LayoutAnimation enable karne ke liye
if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function SyllabusScreen() {
  const insets = useSafeAreaInsets();

  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  // States to track kya khula hua hai
  const [expandedCourse, setExpandedCourse] = useState(null);
  const [subjects, setSubjects] = useState({});
  const [loadingSubjects, setLoadingSubjects] = useState(false);

  const [expandedSubject, setExpandedSubject] = useState(null);
  const [lessons, setLessons] = useState({});
  const [loadingLessons, setLoadingLessons] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const data = await getCourses();
        setCourses(data);
      } catch (err) {
        console.log("Courses error:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const toggleCourse = async (courseId) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);

    if (expandedCourse === courseId) {
      setExpandedCourse(null);
      return;
    }

    setExpandedCourse(courseId);

    // Agar subjects pehle se load nahi hain, toh fetch karo
    if (!subjects[courseId]) {
      setLoadingSubjects(true);
      try {
        const data = await getSubjects(courseId);
        setSubjects((prev) => ({ ...prev, [courseId]: data }));
      } catch (err) {
        console.log("Subjects error:", err);
      } finally {
        setLoadingSubjects(false);
      }
    }
  };

  const toggleSubject = async (subjectId) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);

    if (expandedSubject === subjectId) {
      setExpandedSubject(null);
      return;
    }

    setExpandedSubject(subjectId);

    // Agar lessons pehle se load nahi hain, toh fetch karo
    if (!lessons[subjectId]) {
      setLoadingLessons(true);
      try {
        const data = await getLessons(subjectId);
        setLessons((prev) => ({ ...prev, [subjectId]: data }));
      } catch (err) {
        console.log("Lessons error:", err);
      } finally {
        setLoadingLessons(false);
      }
    }
  };

  const openPdf = (url) => {
    if (url) {
      Linking.openURL(url).catch((err) => console.log("PDF open error:", err));
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.blue} />
        <Text style={{ marginTop: 10, fontFamily: FONTS.regular }}>
          Loading syllabus...
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[
        styles.content,
        {
          paddingTop: insets.top + SPACING.md,
          paddingBottom: insets.bottom + 80,
        },
      ]}
    >
      <Text style={styles.headerTitle}>Course Syllabus</Text>
      <Text style={styles.headerSub}>
        Select a course to view subjects and lessons.
      </Text>

      {courses.length === 0 ? (
        <View style={styles.emptyBox}>
          <BookOpen color={COLORS.muted} size={48} />
          <Text style={styles.emptyText}>No courses available.</Text>
        </View>
      ) : (
        courses.map((course) => {
          const isCourseOpen = expandedCourse === course._id;
          return (
            <View key={course._id} style={styles.accordionContainer}>
              {/* Course Header */}
              <TouchableOpacity
                style={styles.courseHeader}
                activeOpacity={0.7}
                onPress={() => toggleCourse(course._id)}
              >
                <View style={styles.courseTitleRow}>
                  <FolderOpen color={COLORS.blue} size={20} />
                  <Text style={styles.courseTitle}>{course.name}</Text>
                </View>
                {isCourseOpen ? (
                  <ChevronUp color={COLORS.muted} size={20} />
                ) : (
                  <ChevronDown color={COLORS.muted} size={20} />
                )}
              </TouchableOpacity>

              {/* Subjects List */}
              {isCourseOpen && (
                <View style={styles.subjectsContainer}>
                  {loadingSubjects && !subjects[course._id] ? (
                    <ActivityIndicator
                      size="small"
                      color={COLORS.blue}
                      style={{ margin: 10 }}
                    />
                  ) : subjects[course._id]?.length === 0 ? (
                    <Text style={styles.noDataText}>
                      No subjects found in this course.
                    </Text>
                  ) : (
                    subjects[course._id]?.map((subject) => {
                      const isSubjectOpen = expandedSubject === subject._id;
                      return (
                        <View key={subject._id} style={styles.subjectContainer}>
                          {/* Subject Header */}
                          <TouchableOpacity
                            style={styles.subjectHeader}
                            activeOpacity={0.7}
                            onPress={() => toggleSubject(subject._id)}
                          >
                            <Text style={styles.subjectTitle}>
                              {subject.name}
                            </Text>
                            {isSubjectOpen ? (
                              <ChevronUp color={COLORS.muted} size={18} />
                            ) : (
                              <ChevronDown color={COLORS.muted} size={18} />
                            )}
                          </TouchableOpacity>

                          {/* Lessons List */}
                          {isSubjectOpen && (
                            <View style={styles.lessonsContainer}>
                              {loadingLessons && !lessons[subject._id] ? (
                                <ActivityIndicator
                                  size="small"
                                  color={COLORS.blue}
                                  style={{ margin: 10 }}
                                />
                              ) : lessons[subject._id]?.length === 0 ? (
                                <Text style={styles.noDataText}>
                                  No lessons available.
                                </Text>
                              ) : (
                                lessons[subject._id]?.map((lesson) => (
                                  <View
                                    key={lesson._id}
                                    style={styles.lessonCard}
                                  >
                                    <View style={{ flex: 1 }}>
                                      <Text style={styles.lessonTitle}>
                                        {lesson.title || "Untitled Lesson"}
                                      </Text>
                                      {lesson.content ? (
                                        <Text
                                          style={styles.lessonContent}
                                          numberOfLines={3}
                                        >
                                          {lesson.content}
                                        </Text>
                                      ) : null}
                                    </View>
                                    {lesson.pdfUrl ? (
                                      <TouchableOpacity
                                        style={styles.pdfBtn}
                                        onPress={() => openPdf(lesson.pdfUrl)}
                                      >
                                        <FileText
                                          color={COLORS.surface}
                                          size={16}
                                        />
                                        <Text style={styles.pdfBtnText}>
                                          PDF
                                        </Text>
                                      </TouchableOpacity>
                                    ) : null}
                                  </View>
                                ))
                              )}
                            </View>
                          )}
                        </View>
                      );
                    })
                  )}
                </View>
              )}
            </View>
          );
        })
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.mist },
  content: { paddingHorizontal: SPACING.md },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.mist,
  },

  headerTitle: { fontFamily: FONTS.semiBold, fontSize: 22, color: COLORS.navy },
  headerSub: {
    fontFamily: FONTS.regular,
    fontSize: 13,
    color: COLORS.muted,
    marginTop: 4,
    marginBottom: SPACING.lg,
  },

  emptyBox: { marginTop: 50, alignItems: "center", opacity: 0.5 },
  emptyText: { fontFamily: FONTS.regular, fontSize: 15, marginTop: 10 },

  accordionContainer: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.card,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.line,
    overflow: "hidden",
    elevation: 1,
  },
  courseHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: SPACING.md,
  },
  courseTitleRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  courseTitle: { fontFamily: FONTS.semiBold, fontSize: 16, color: COLORS.navy },

  subjectsContainer: {
    backgroundColor: "#F9FAFB",
    borderTopWidth: 1,
    borderTopColor: COLORS.line,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  noDataText: {
    fontFamily: FONTS.regular,
    fontSize: 13,
    color: COLORS.muted,
    marginVertical: 10,
  },

  subjectContainer: {
    backgroundColor: COLORS.surface,
    borderRadius: 8,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.line,
    overflow: "hidden",
  },
  subjectHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: SPACING.sm + 4,
  },
  subjectTitle: {
    fontFamily: FONTS.medium,
    fontSize: 14,
    color: COLORS.ink,
    flex: 1,
  },

  lessonsContainer: {
    padding: SPACING.sm,
    backgroundColor: "#F3F4F6",
    borderTopWidth: 1,
    borderTopColor: COLORS.line,
  },
  lessonCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: COLORS.surface,
    padding: SPACING.sm + 4,
    borderRadius: 6,
    marginBottom: SPACING.sm,
    gap: 10,
  },
  lessonTitle: {
    fontFamily: FONTS.semiBold,
    fontSize: 13,
    color: COLORS.navy,
    marginBottom: 4,
  },
  lessonContent: {
    fontFamily: FONTS.regular,
    fontSize: 12,
    color: COLORS.muted,
    lineHeight: 16,
  },

  pdfBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: COLORS.error,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  pdfBtnText: {
    fontFamily: FONTS.semiBold,
    fontSize: 12,
    color: COLORS.surface,
  },
});
