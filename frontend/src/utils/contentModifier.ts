import axios from "axios";

export const modifyContent = async (selectedText: string): Promise<string | null> => {
  try {
    const imageRegex = /!\[(.*?)\]\((.*?)\)/;
    const isImageMarkdown = imageRegex.test(selectedText);
    let response;

    if (isImageMarkdown) {
      const matches = selectedText.match(imageRegex);
      const altText = matches ? matches[1] : "";
      response = await axios.post("http://127.0.0.1:8000/modify_image/", {
        imgText: altText,
      });
    } else {
      response = await axios.post("http://127.0.0.1:8000/modify_text/", {
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