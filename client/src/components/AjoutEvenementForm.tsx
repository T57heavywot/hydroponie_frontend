import React from "react";
import EventForm from "./EventForm";

interface AjoutEvenementFormProps {
  eventText: string;
  setEventText: React.Dispatch<React.SetStateAction<string>>;
  eventTime: string;
  setEventTime: React.Dispatch<React.SetStateAction<string>>;
  eventCategoryGroup: string;
  setEventCategoryGroup: React.Dispatch<React.SetStateAction<string>>;
  setEventCategories: React.Dispatch<React.SetStateAction<string[]>>;
  chartList: any[];
  onSubmit: (e: React.FormEvent) => void;
}

const AjoutEvenementForm: React.FC<AjoutEvenementFormProps> = ({
  eventText,
  setEventText,
  eventTime,
  setEventTime,
  eventCategoryGroup,
  setEventCategoryGroup,
  setEventCategories,
  chartList,
  onSubmit
}) => {
  return (
    <EventForm
      eventText={eventText}
      setEventText={setEventText}
      eventTime={eventTime}
      setEventTime={setEventTime}
      eventCategoryGroup={eventCategoryGroup}
      setEventCategoryGroup={setEventCategoryGroup}
      setEventCategories={setEventCategories}
      chartList={chartList}
      onSubmit={onSubmit}
    />
  );
};

export default AjoutEvenementForm;
