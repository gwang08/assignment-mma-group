import React from "react";
import {View} from "react-native";
import MedicineRequestCard from "./MedicineRequestCard";
import EmptyState from "./EmptyState";

const MedicineRequestList = ({requests = [], onViewRequest}) => {
  return (
    <View style={{padding: 20, gap: 15}}>
      {requests.length === 0 ? (
        <EmptyState message="Không có yêu cầu thuốc nào" />
      ) : (
        requests.map((request, index) => (
          <MedicineRequestCard
            key={request._id || index}
            request={request}
            onPress={() => onViewRequest(request)}
          />
        ))
      )}
    </View>
  );
};

export default MedicineRequestList;
