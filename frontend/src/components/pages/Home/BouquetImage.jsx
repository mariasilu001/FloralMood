import React, { useState, useEffect } from "react";

const BouquetImage = ({ imageBlob, altText }) => {
    // Инициализируем стейт как null для предотвращения пустых src=""
    const [imgSrc, setImgSrc] = useState(null);

    useEffect(() => {
        // Если картинки нет вообще, ставим красивую дефолтную заглушку
        if (!imageBlob) {
            setImgSrc("https://i.pinimg.com/1200x/4c/fe/8f/4cfe8f22648e02856fabf623ce00334b.jpg");
            return;
        }

        let objectUrl = null;

        // Если это бинарный Blob/File из IndexedDB — создаем ссылку в памяти
        if (imageBlob instanceof Blob || imageBlob instanceof File) {
            objectUrl = URL.createObjectURL(imageBlob);
            setImgSrc(objectUrl);
        } else {
            // Если это обычная строковая ссылка-путь
            setImgSrc(imageBlob);
        }

        // Cleanup: безжалостно уничтожаем ссылку при размонтировании, защищая ОЗУ Лили
        return () => {
            if (objectUrl) {
                URL.revokeObjectURL(objectUrl);
            }
        };
    }, [imageBlob]);

    // Жесткая защита от пустых тегов <img> в DOM-дереве
    if (!imgSrc) {
        return <div className="image-placeholder">Загрузка фото...</div>;
    }

    // РЕНДЕР С ИДЕАЛЬНЫМ СЖАТИЕМ КАРТИНКИ
    return (
        <img 
            src={imgSrc} 
            alt={altText} 
            style={{ 
                width: "100%", 
                height: "100%", 
                // ВНИМАНИЕ, ЛИЛИ! Магическое свойство objectFit: "contain"
                // Оно заставляет картинку пропорционально сжиматься и ПОЛНОСТЬЮ 
                // помещаться внутрь любого блока, никогда не обрезая края!
                objectFit: "contain", 
                display: "block"
            }} 
        />
    );
};

export default BouquetImage;