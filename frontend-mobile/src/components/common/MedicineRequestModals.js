import React, { useState } from "react";
import MedicineRequestModal from "./MedicineRequestModal";
import StudentPickerModal from "./StudentPickerModal";
import MedicineRequestDetailModal from "./MedicineRequestDetailModal";
import MedicineRequestSummaryModal from "./MedicineRequestSummaryModal";

const MedicineRequestModals = ({
  // Modal visibility states
  isModalVisible,
  isStudentPickerVisible,
  isDetailModalVisible,
  isSummaryModalVisible,

  // State setters
  setIsModalVisible,
  setIsStudentPickerVisible,
  setIsDetailModalVisible,
  setIsSummaryModalVisible,

  // Data
  editingRequest,
  selectedStudent,
  students,
  medicines,
  startDate,
  endDate,
  selectedRequest,
  studentSearchQuery,

  // State setters for data
  setEditingRequest,
  setStudentSearchQuery,

  // Functions
  getSelectedStudentInfo,
  validateMedicines,
  updateMedicine,
  addMedicine,
  removeMedicine,
  setStartDate,
  setEndDate,
  handleShowSummary,
  resetForm,
  handleStudentSelect,
  getFilteredStudents,
  canEditRequest,
  getMedicineRequestStatus,
  getStudentName,
  formatDate,
  handleEditRequest,
  handleDeleteRequest,
  formatDateForSummary,
  handleBackToEdit,
  handleCreateRequest,
  handleUpdateRequest,
}) => {
  const handleModalClose = () => {
    setIsModalVisible(false);
    setEditingRequest(null);
    resetForm();
  };

  const handleStudentPress = () => {
    setIsStudentPickerVisible(true);
  };

  const handleStudentPickerClose = () => {
    setIsStudentPickerVisible(false);
  };

  const handleDetailModalClose = () => {
    setIsDetailModalVisible(false);
  };

  const handleSummaryModalClose = () => {
    setIsSummaryModalVisible(false);
  };

  const handleBackToEditFromSummary = () => {
    handleBackToEdit();
  };

  const handleConfirmFromSummary = () => {
    if (editingRequest) {
      handleUpdateRequest();
    } else {
      handleCreateRequest();
    }
  };

  return (
    <>
      {/* Main Create/Edit Modal */}
      <MedicineRequestModal
        visible={isModalVisible}
        onClose={handleModalClose}
        editingRequest={editingRequest}
        selectedStudent={selectedStudent}
        students={students}
        medicines={medicines}
        startDate={startDate}
        endDate={endDate}
        onStudentPress={handleStudentPress}
        onMedicineUpdate={updateMedicine}
        onMedicineAdd={addMedicine}
        onMedicineRemove={removeMedicine}
        onStartDateChange={setStartDate}
        onEndDateChange={setEndDate}
        onShowSummary={handleShowSummary}
        validateMedicines={validateMedicines}
        getSelectedStudentInfo={getSelectedStudentInfo}
      />

      {/* Student Picker Modal */}
      <StudentPickerModal
        visible={isStudentPickerVisible}
        onClose={handleStudentPickerClose}
        students={students}
        selectedStudent={selectedStudent}
        searchQuery={studentSearchQuery}
        onSearchChange={setStudentSearchQuery}
        onStudentSelect={handleStudentSelect}
        getFilteredStudents={getFilteredStudents}
      />

      {/* Detail Modal */}
      <MedicineRequestDetailModal
        visible={isDetailModalVisible}
        onClose={handleDetailModalClose}
        request={selectedRequest}
        canEditRequest={canEditRequest}
        getMedicineRequestStatus={getMedicineRequestStatus}
        getStudentName={getStudentName}
        formatDate={formatDate}
        onEdit={handleEditRequest}
        onDelete={handleDeleteRequest}
      />

      {/* Summary Modal */}
      <MedicineRequestSummaryModal
        visible={isSummaryModalVisible}
        onClose={handleSummaryModalClose}
        editingRequest={editingRequest}
        selectedStudentInfo={getSelectedStudentInfo()}
        startDate={startDate}
        endDate={endDate}
        medicines={medicines}
        formatDateForSummary={formatDateForSummary}
        onBackToEdit={handleBackToEditFromSummary}
        onConfirm={handleConfirmFromSummary}
      />
    </>
  );
};

export default MedicineRequestModals;
