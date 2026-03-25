export const BOOKING_CONTENT = {
  title: "Book an Appointment",
  subtitle:
    "Fill out the form below and we'll call you within 24 hours to confirm your appointment.",
  form: {
    nameLabel: "Name*",
    petLabel: "Pet's Name & Type*",
    serviceLabel: "Service Needed*",
    branchLabel: "Preferred Branch*",
    branchOptions: [
      { id: "branch-kawit", value: "Kawit", label: "Kawit" },
      { id: "branch-imus", value: "Imus", label: "Imus" },
    ],
    datetimeLabel: "Date & Time*",
  },
} as const;
