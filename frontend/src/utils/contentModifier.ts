import axios from "axios";

export const modifyContent = async (selectedText: string): Promise<string | null> => {
  try {
    const imageRegex = /!\[(.*?)\]\((.*?)\)/;
    const isImageMarkdown = imageRegex.test(selectedText);
    let response;

    if (isImageMarkdown) {
      const matches = selectedText.match(imageRegex);
      const altText = matches ? matches[1] : "";
      response = await axios.post(`https://notecraft-backend-ag98.onrender.com/modify_image/`, {
        imgText: altText,
      });
    } else {
      response = await axios.post(`https://notecraft-backend-ag98.onrender.com/modify_text/`, {
        text: selectedText,
      });
    }

    if (response && response.data) {
      return response.data.modifiedContent;
    }
    
    return null;
  } catch (error) {
    console.error("Error modifying content:", error);
    return null;
  }
};