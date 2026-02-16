import { ConsumeMessage } from "amqplib";
import { getChannel } from "../../config/rabbitmq";
import logger from "../../utils/logger";
import { envConfig } from "../envConfig";
import axios from "axios";
import { v0 } from "v0-sdk";

// Convert points arrays to readable text
const formatPoints = (points: any[]) =>
  points
    .map(
      (p, idx) => `${idx + 1}. ${p.text}`, // extract the 'text' field only
    )
    .join("\n") || "No examples available.";

export const consumeQueue = async (queue: string): Promise<void> => {
  const channel = getChannel();

  await channel.assertQueue(queue, { durable: true });

  channel.consume(queue, async (msg: ConsumeMessage | null) => {
    if (!msg) return;

    let data: any;
    const oldKey = process.env.V0_API_KEY;

    try {
      data = JSON.parse(msg.content.toString());

      console.log("📥 Received:", data);

      // Validation
      if (!data?.prompt) {
        console.error("❌ Prompt is required");
        return channel.nack(msg, false, false); // reject message
      }

      if (!data?.userId) {
        console.error("❌ User ID is required");
        return channel.nack(msg, false, false);
      }

      if (!data?.voApiKey) {
        console.error("❌ V0 API Key is required");
        return channel.nack(msg, false, false);
      }

      // ✅ Process message here
      logger.info("✅ Processing message...");
      logger.info(`Fetched V0 API key ${data?.voApiKey}`);
      process.env.V0_API_KEY = data?.voApiKey; // set key dynamically
      logger.info(
        `Set V0 API key dynamically for chat creation: ${data?.voApiKey}`,
      );

      // Change task status into inprogress
      try {
        await axios.patch(
          `${envConfig.USER_SERVICE_URL}/api/v1/task/${data?.taskId}`,
          { status: 'in_progress' }
        );
        logger.info('Task updated');
      } catch (error) {
        logger.error('Failed to update task');
        logger.error(error);
      }

      // Get embeddings related to user prompt
      const response = await axios.get(
        `${envConfig.KNOWLEDGE_API_URL}/api/v1/search?query=${encodeURIComponent(data?.prompt)}`,
      );

      const resData = response.data;
      const components_points = resData.data.components_points || [];
      const stories_points = resData.data.stories_points || [];
      const templates_points = resData.data.templates_points || [];
      const ts_points = resData.data.ts_points || [];

      const componentsText = formatPoints(components_points);
      const storiesText = formatPoints(stories_points);
      const templatesText = formatPoints(templates_points);
      const tsText = formatPoints(ts_points);

      // Create a new chat on Vercel with the Prompt / given data
      // Create chat using dynamic V0 key
      const chatPayload: any = {
        message: `${data?.prompt}`,
        system: `
            You are a best senior frontend engineer in Sitecore. You are developing XM Cloud React Components on Nextjs Projects.

            Pre Actions:
            - Create basic bare minimal Nextjs project.
            - If user didn't give any image reference, you should ask an image from the user. After that you can proceed and should create a pixel perfect design as the reference image. Don't create component if you don't have a image reference.
            - In the page.tsx file just render the relevant component for show it on the screen. Don't do any other logic in the page.tsx file. Just render the relevant component for show it on the screen.
            - If user provided image reference, you can proceed directly and should create a pixel perfect design as the reference image.

            Stylings:
            - Use tailwindcss for styling the component. Use className attribute for styling. Do not create separate css file.
            - Create a responsive design that works well for all the devices.
            - Design should be pixel perfect to the provided reference image.
            - If user wants don't want to create component for multiple themes (like dark mode, light mode) you can create just one theme for the component. Don't create multiple themes for the component if user doesn't want. Create just one theme for the component.

            How do you create files / folder structure:
            - First you have to create relevant .tsx component file with relevant name related to the component under components/component_name/ComponentName.tsx with relavant sitecore fields
            - Second that in the app folder create just react component exact to the same previous created file without sitecore fields.
            - You should render this component / Second created file in the page.tsx file for show it on the screen. 
            - If you change the second file UI, you also should change the first file with sitecore fields. You should create both of them same and if you change one of them, you should change the other one as well. Because one of them is for sitecore and one of them is for show on the screen. You should create both of them same and if you change one of them, you should change the other one as well.

            Task:
            ${data?.prompt}

            Templates Examples:
            ${templatesText}

            Components Examples:
            ${componentsText}

            Stories Examples:
            ${storiesText}
            
            Other Helper Functions / Files Examples:
            - If you can get ideas from these files / helper functions you can get.
            ${tsText}

            How should you think for create and code a component:

            Special Instructions:
            - Use comments for explain your code along with the coding. Write comments for each part of the code for explain what is doing and why you are doing that.
            - Dont use semantic tags for containers (footer, header). Use can use section/ div tags.
            - Create varients correctly and all the varients should be exported as well. Don't use default export for the component. You should export all varients as a named exports. If you create multiple varients for the component, you should export all of them as a named exports. Don't use default export for the component. You should export all varients as a named exports.
            - Don't forget to create both files for the component. First one with sitecore fields and second one without sitecore fields. You should create both of them same and if you change one of them, you should change the other one as well. Because one of them is for sitecore and one of them is for show on the screen. You should create both of them same and if you change one of them, you should change the other one as well.
            - If you don't have any information about the component or you don't understand the task, you can ask for more information from the user. You can ask for more details about the component or you can ask for more reference images. You can also ask for more examples if you need. Don't hesitate to ask for more information if you don't understand the task or if you don't have enough information to create the component.
            - User latest contentsdk components (Text as ContentSdkText / Link as ContentSdkLink). Try to use ContentSDK prefix because it is the modern implementation so far. 
            - Check placeholders and check whether you used components for specific placeholder or not correctly.
            - Check user wants .stories.tsx file for relevant compoennt. Otherwise don't create stories files.
            - Always refer templates examples. It includes all the sitecore fields that can you use. Don't over use or miss/less use template fields. If you want to use less amount of fields for the code rather than templates examples, you can use less amount of fields but if you want to use more amount of fields for the code rather than templates examples, you can use more amount of fields as well. But make sure to point out to the user in the end.
            - If logo has both image with a text, consider as a single image and create the component according to the reference image. Don't create separate image and text for the logo if the logo has both image and text. Consider as a single image and create the component according to the reference image. 

            Output format:
            - Return ONLY the React component codes
            - Create: .tsx file realted to the component

            Post Actions:
            - Revise the code again and check whether all are correct.
            - Make sure there is no linting or formatting errors in the code.
          `,
      };

      // Only attach image if it exists
      if (data?.image) {
        chatPayload.attachments = [
          {
            url: data?.image,
          },
        ];
      }
      
      const result = await v0.chats.create(chatPayload);

      // Change task status into completed
      try {
        await axios.patch(
          `${envConfig.USER_SERVICE_URL}/api/v1/task/${data?.taskId}`,
          { status: 'completed' }
        );
        logger.info('Task updated');
      } catch (error) {
        logger.error('Failed to update task');
      }

      logger.info("Component generate query was success");
      logger.info(result);

      // Acknowledge after successful processing
      channel.ack(msg);
    } catch (error) {
      console.error("❌ Error processing message:", error);
      channel.nack(msg, false, false);
    } finally {
      process.env.V0_API_KEY = oldKey; // restore original key
      logger.info(`Reset V0 API key: ${data?.voApiKey}`);
    }
  });
};
