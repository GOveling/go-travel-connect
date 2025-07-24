import { useLanguage } from "@/contexts/LanguageContext";

const BookingHeader = () => {
  const { t } = useLanguage();

  return (
    <div className="pt-8 pb-4">
      <h2 className="text-3xl font-bold text-gray-800 mb-2">
        {t("booking.title")}
      </h2>
      <p className="text-gray-600">{t("booking.subtitle")}</p>
    </div>
  );
};

export default BookingHeader;
