import React from "react";
import {View} from "react-native";
import StudentCard from "./StudentCard";
import EmptyState from "./EmptyState";

function StudentList({students, onViewStudent}) {
  if (!students || students.length === 0) {
    return <EmptyState message="Không có học sinh nào" />;
  }
  return (
    <View style={{padding: 20, gap: 15}}>
      {students.map((student, idx) => (
        <StudentCard
          key={student._id || idx}
          student={student}
          onPress={() => onViewStudent(student)}
        />
      ))}
    </View>
  );
}

export default StudentList;
