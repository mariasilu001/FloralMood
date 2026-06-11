import React, { useState, useEffect } from "react";

const BouquetImage = ({ imageBlob, altText }) => {
  // 1. Инициализируем стейт как null, а не как пустую строку ""
  const [imgSrc, setImgSrc] = useState(null);

  useEffect(() => {
    // Если картинки нет вообще, ставим заглушку из интернета
    if (!imageBlob) {
      setImgSrc(
        "https://i.pinimg.com/1200x/4c/fe/8f/4cfe8f22648e02856fabf623ce00334b.jpg",
      );
      return;
    }

    let objectUrl = null;

    // Если это Blob (из базы) - создаем системную ссылку
    if (imageBlob instanceof Blob) {
      objectUrl = URL.createObjectURL(imageBlob);
      setImgSrc(objectUrl);
    } else {
      // Если это осталась строковая ссылка
      setImgSrc(imageBlob);
    }

    // Cleanup функция очистки памяти
    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [imageBlob]);

  // 2. ЖЕСТКАЯ ЗАЩИТА: Если imgSrc равен null, возвращаем пустой блок!
  // Никаких <img src=""> в DOM дереве не появится, консоль будет чистой.
  if (!imgSrc) {
    return <div className="image-placeholder">Загрузка фото...</div>;
  }

  // 3. Рендерим только тогда, когда в imgSrc лежит реальный URL
  return <img src={imgSrc} alt={altText} />;
};

export default BouquetImage;
