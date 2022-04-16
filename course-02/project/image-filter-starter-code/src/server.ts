import express, {Request, Response} from 'express';
import bodyParser from 'body-parser';
import {filterImageFromURL, deleteLocalFiles} from './util/util';

(async () => {

    // Init the Express application
    const app = express();

    // Set the network port
    const port = process.env.PORT || 8082;

    // Use the body parser middleware for post requests
    app.use(bodyParser.json());

    // @TODO1 IMPLEMENT A RESTFUL ENDPOINT
    // GET /filteredimage?image_url={{URL}}
    // endpoint to filter an image from a public url.
    // IT SHOULD
    //    1
    // QUERY PARAMATERS
    //    image_url: URL of a publicly accessible image
    // RETURNS
    //   the filtered image file [!!TIP res.sendFile(filteredpath); might be useful]
    app.get("/filtered-image", async (req: Request, res: Response) => {
        let {image_url}: { image_url: string } = req.query;

        //    1. validate the image_url query
        validateImageURL(image_url, res);

        //    2. call filterImageFromURL(image_url) to filter the image
        filterImageFromURL(image_url).then(
            (imagePath: string) => {
                //    3. send the resulting file in the response
                res.status(200).sendFile(imagePath, (error: Error) => {
                    if (error) {
                        console.log(`Error on sendFile: ` + error);
                        res.sendStatus(500).send(`Error when sending file, please try again`);
                    } else {
                        console.log(`Successfully send ` + imagePath)
                    }

                    //    4. deletes any files on the server on finish of the response
                    deleteLocalFiles(Array.of(imagePath))
                });
            }
        ).catch(
            (error: Error) => {
                return res.status(422).send(`Could not process image_url: ` + error);
            }
        )
    });

    function validateImageURL(inputURL: string, res: Response) {
        if (!inputURL) {
            return res.status(400).send(`image_url parameter is required`);
        }
        try {
            new URL(inputURL);
        } catch (_) {
            return res.status(400).send(inputURL + ` is invalid url`);
        }
        if (!/\.(jpg|jpeg|png|webp|avif|gif|svg)$/.test(inputURL)) {
            return res.status(400).send(inputURL + ` is invalid image`);
        }
    }

    /**************************************************************************** */

    //! END @TODO1

    // Root Endpoint
    // Displays a simple message to the user
    app.get("/", async (req, res) => {
        res.send("try GET /filtered-image?image_url={{}}")
    });


    // Start the Server
    app.listen(port, () => {
        console.log(`server running http://localhost:${port}`);
        console.log(`press CTRL+C to stop server`);
    });
})();
