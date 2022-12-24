import { PreSignUpTriggerEvent, Context, Callback } from 'aws-lambda';

/**
 * This function auto-confirm all the users that get registered
 * @param event The event received by the function
 * @param context The invocation context
 * @param callback The callback to return the control
 */
export async function handler(
  event: PreSignUpTriggerEvent,
  context: Context,
  callback: Callback
) {
  event.response.autoConfirmUser = true;

  callback(null, event);
}
