# Web Scraping - Internet Plans

This project performs web scraping to extract the pricing of internet plans offered by Spectrum for different specified locations. The extracted data can be retrieved in either CSV or JSON format based on the specified query parameter.

## Technologies Used

- **Node.js** version 23
- **Puppeteer** for interacting with web pages
- **Docker** for containerization

## Installation

### 1. Clone this repository:

```bash
git clone https://github.com/jovazxc/sunroom-scraping
cd sunroom-scraping
```

### 2. Install dependencies using Yarn:

```bash
yarn
```

## Usage

### Locally

To run the project locally, use the following command:

```bash
yarn dev
```

This will start the server on your local machine.

### With Docker

You can also run the project using Docker. First, build and run the container with:

```bash
docker compose up --build
```

This will start the server inside a Docker container.

## Endpoint

To fetch the internet plan pricing, make a GET request to the following endpoint:

- URL: http://localhost:3001/sunroom/internet-plans

### Parameters

- **method**: (optional) If you want the data in JSON format, add the `method=json` query parameter. Example:

  ```bash
  http://localhost:3001/sunroom/internet-plans?method=json
  ```

If the parameter is not specified, the server will return a CSV file by default.
