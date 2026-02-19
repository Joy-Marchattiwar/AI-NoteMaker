# AI-NoteMaker 📝✨

![GitHub release](https://img.shields.io/github/v/release/Joy-Marchattiwar/AI-NoteMaker?style=flat-square&color=brightgreen) ![Docker](https://img.shields.io/badge/docker-blue?style=flat-square) ![Django](https://img.shields.io/badge/django-green?style=flat-square) ![Next.js](https://img.shields.io/badge/next.js-black?style=flat-square) 

Welcome to **AI-NoteMaker**, a full-stack web application designed to enhance your academic experience. This project allows users to upload academic PDFs, generate AI-powered notes, and retrieve relevant content using Retrieval-Augmented Generation (RAG). Built with a robust tech stack including Django, Celery, and Next.js, this app is optimized for long documents and supports asynchronous processing. Plus, it runs fully containerized with Docker.

## Table of Contents

- [Features](#features)
- [Technologies Used](#technologies-used)
- [Installation](#installation)
- [Usage](#usage)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)
- [Releases](#releases)

## Features

- **PDF Upload**: Easily upload your academic PDFs.
- **AI-Powered Notes**: Generate concise notes from your documents using advanced AI algorithms.
- **Content Retrieval**: Quickly find relevant sections of your documents with RAG.
- **Async Processing**: Handle large documents without blocking the user interface.
- **Containerized Environment**: Run the application in a fully isolated Docker environment for easy setup and deployment.

## Technologies Used

- **Django**: A high-level Python web framework that encourages rapid development.
- **Django REST Framework**: A powerful toolkit for building Web APIs.
- **Celery**: An asynchronous task queue/job queue based on distributed message passing.
- **Next.js**: A React framework that enables server-side rendering and static site generation.
- **Docker**: A platform for developing, shipping, and running applications in containers.
- **Redis**: An in-memory data structure store used as a database, cache, and message broker.
- **Pinecone**: A vector database that allows for fast and efficient retrieval of information.
- **Cloudinary**: A cloud service that offers image and video management.
- **Llama**: A state-of-the-art model for natural language processing tasks.
- **Qwen API**: A tool for enhancing AI functionalities.

## Installation

To set up the **AI-NoteMaker** application, follow these steps:

1. **Clone the repository**:

   ```bash
   git clone https://github.com/Joy-Marchattiwar/AI-NoteMaker.git
   cd AI-NoteMaker
   ```

2. **Install Docker**: Ensure you have Docker and Docker Compose installed on your machine. You can download Docker from [here](https://www.docker.com/products/docker-desktop).

3. **Build the Docker containers**:

   ```bash
   docker-compose build
   ```

4. **Run the application**:

   ```bash
   docker-compose up
   ```

5. **Access the application**: Open your web browser and navigate to `http://localhost:3000`.

## Usage

Once the application is running, you can start using it by following these steps:

1. **Upload a PDF**: Click on the upload button to select and upload your academic PDF file.

2. **Generate Notes**: After the PDF is uploaded, click on the "Generate Notes" button. The AI will process the document and create notes.

3. **Retrieve Content**: Use the search functionality to find specific sections of your document quickly.

4. **Download Notes**: Once the notes are generated, you can download them in your preferred format.

## Contributing

We welcome contributions to **AI-NoteMaker**! If you would like to contribute, please follow these steps:

1. **Fork the repository**: Click the "Fork" button at the top right of this page.
2. **Create a new branch**: 

   ```bash
   git checkout -b feature/YourFeatureName
   ```

3. **Make your changes**: Implement your feature or fix a bug.
4. **Commit your changes**:

   ```bash
   git commit -m "Add your message here"
   ```

5. **Push to the branch**:

   ```bash
   git push origin feature/YourFeatureName
   ```

6. **Create a pull request**: Go to the original repository and click on "New Pull Request".

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Contact

For questions or suggestions, please reach out to:

- **Joy Marchattiwar**: [Your Email](mailto:youremail@example.com)

## Releases

For the latest releases, visit the [Releases](https://github.com/Joy-Marchattiwar/AI-NoteMaker/releases) section. Here, you can download and execute the latest version of the application.

## Conclusion

Thank you for checking out **AI-NoteMaker**! We hope this tool enhances your academic journey by making note-taking and content retrieval easier and more efficient. We appreciate your feedback and contributions to improve this project.