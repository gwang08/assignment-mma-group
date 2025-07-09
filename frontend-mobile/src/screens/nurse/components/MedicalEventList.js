import React from "react";
import {View} from "react-native";
import MedicalEventCard from "./MedicalEventCard";
import EmptyState from "./EmptyState";

const MedicalEventList = ({events = [], onViewEvent}) => {
  return (
    <View style={{padding: 20, gap: 15}}>
      {events.length === 0 ? (
        <EmptyState message="Không có sự kiện y tế nào" />
      ) : (
        events.map((event, index) => (
          <MedicalEventCard
            key={event._id || index}
            event={event}
            onPress={onViewEvent}
          />
        ))
      )}
    </View>
  );
};

export default MedicalEventList;
