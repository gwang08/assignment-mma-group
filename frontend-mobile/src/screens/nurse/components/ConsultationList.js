import React from "react";
import {View} from "react-native";
import ConsultationCard from "./ConsultationCard";
import EmptyState from "./EmptyState";

function ConsultationList({consultations, onViewConsultation}) {
  return (
    <View style={{padding: 20, gap: 15}}>
      {consultations.length === 0 ? (
        <EmptyState message="Không có lịch tư vấn nào" />
      ) : (
        consultations.map((consultation, idx) => (
          <ConsultationCard
            key={consultation._id || idx}
            consultation={consultation}
            onPress={() => onViewConsultation(consultation)}
          />
        ))
      )}
    </View>
  );
}

export default ConsultationList;
