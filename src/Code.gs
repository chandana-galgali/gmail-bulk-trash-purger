/**
 * Gmail Bulk Trash Purger
 * https://github.com/chandana-galgali/gmail-bulk-trash-purger
 *
 * Permanently deletes everything in your Gmail Trash, in batches, without
 * hitting the "An error occurred" timeout you get from Gmail's
 * "Select all -> Delete forever" button.
 *
 * Functions you can run from the Apps Script editor:
 *   countTrash()          Dry run. Counts what is in Trash and deletes nothing.
 *   autoEmptyTrash()      Permanently deletes everything in Trash.
 *   installDailyTrigger() Runs autoEmptyTrash() automatically every day.
 *   removeAllTriggers()   Stops all automatic runs created by this script.
 *
 * Requires the Gmail advanced service (identifier: "Gmail").
 *
 * MIT License (c) 2026 Chandana Galgali
 */

// ---------------------------------------------------------------------------
// Settings
// ---------------------------------------------------------------------------
var CONFIG = {
  // Optional Gmail search filter applied *inside* Trash. Empty = everything.
  // Example: 'older_than:7d' keeps the last week of trash recoverable.
  // Note: older_than uses the email's date, not the date it was trashed.
  EXTRA_QUERY: '',

  // Apps Script kills a run after 6 minutes. Stop cleanly before that.
  MAX_RUNTIME_MS: 5 * 60 * 1000,

  // If Trash is not empty when time runs out, schedule another run
  // automatically (1 minute later) until it is.
  AUTO_CONTINUE: true,

  // Hour of day (0-23, in the project's time zone) for installDailyTrigger().
  DAILY_HOUR: 2,

  // Messages fetched per request (Gmail API maximum is 500).
  PAGE_SIZE: 500
};

var CONTINUE_HANDLER = 'autoEmptyTrash';
var DAILY_ID_KEY = 'DAILY_TRIGGER_ID';

// ---------------------------------------------------------------------------
// Main entry point (kept under its original name so existing triggers work)
// ---------------------------------------------------------------------------
function autoEmptyTrash() {
  var start = Date.now();
  var deleted = 0;
  var lastFirstId = null;
  var stalls = 0;

  removeContinuationTriggers_();

  while (true) {
    if (Date.now() - start > CONFIG.MAX_RUNTIME_MS) {
      Logger.log('Time budget reached after deleting ' + deleted + ' messages.');
      if (CONFIG.AUTO_CONTINUE) {
        scheduleContinuation_();
        Logger.log('More remain. Another run is scheduled in about 1 minute.');
      } else {
        Logger.log('More remain. Click Run again to continue.');
      }
      return deleted;
    }

    var ids = listTrashIds_(null).ids;
    if (ids.length === 0) break;

    // Safety valve: if the same page keeps coming back, deletion is not
    // taking effect. Stop instead of looping until the 6-minute kill.
    if (ids[0] === lastFirstId) {
      stalls++;
      if (stalls >= 3) {
        Logger.log('Deletion appears stuck; stopping. Deleted ' + deleted + ' so far.');
        return deleted;
      }
    } else {
      stalls = 0;
    }
    lastFirstId = ids[0];

    deleted += deleteIds_(ids);
    Logger.log('Deleted ' + deleted + ' messages so far...');
  }

  Logger.log('Done. Trash is empty. Permanently deleted ' + deleted + ' messages.');
  return deleted;
}

/**
 * Dry run: counts the messages that autoEmptyTrash() would delete.
 * Deletes nothing.
 */
function countTrash() {
  var total = 0;
  var token = null;
  do {
    var page = listTrashIds_(token);
    total += page.ids.length;
    token = page.nextPageToken;
  } while (token);
  Logger.log(total + ' message(s) in Trash' +
    (CONFIG.EXTRA_QUERY ? ' matching "' + CONFIG.EXTRA_QUERY + '"' : '') +
    '. Nothing was deleted.');
  return total;
}

// ---------------------------------------------------------------------------
// Scheduling helpers
// ---------------------------------------------------------------------------
function installDailyTrigger() {
  removeAllTriggers();
  var trigger = ScriptApp.newTrigger('autoEmptyTrash')
    .timeBased()
    .everyDays(1)
    .atHour(CONFIG.DAILY_HOUR)
    .create();
  PropertiesService.getScriptProperties().setProperty(DAILY_ID_KEY, trigger.getUniqueId());
  Logger.log('Daily trigger installed (around ' + CONFIG.DAILY_HOUR + ':00, ' +
    Session.getScriptTimeZone() + ').');
}

function removeAllTriggers() {
  var triggers = ScriptApp.getProjectTriggers();
  for (var i = 0; i < triggers.length; i++) {
    ScriptApp.deleteTrigger(triggers[i]);
  }
  PropertiesService.getScriptProperties().deleteProperty(DAILY_ID_KEY);
  Logger.log('Removed ' + triggers.length + ' trigger(s).');
}

// ---------------------------------------------------------------------------
// Internals
// ---------------------------------------------------------------------------
function listTrashIds_(pageToken) {
  var options = {
    labelIds: ['TRASH'],
    includeSpamTrash: true,
    maxResults: CONFIG.PAGE_SIZE,
    fields: 'messages/id,nextPageToken'
  };
  if (CONFIG.EXTRA_QUERY) options.q = CONFIG.EXTRA_QUERY;
  if (pageToken) options.pageToken = pageToken;

  var res = Gmail.Users.Messages.list('me', options);
  var ids = (res.messages || []).map(function (m) { return m.id; });
  return { ids: ids, nextPageToken: res.nextPageToken || null };
}

/** Deletes ids in one batch call; falls back to one-by-one on failure. */
function deleteIds_(ids) {
  try {
    Gmail.Users.Messages.batchDelete({ ids: ids }, 'me');
    return ids.length;
  } catch (e) {
    Logger.log('Batch delete failed (' + e.message + '). Retrying one by one.');
    var count = 0;
    for (var i = 0; i < ids.length; i++) {
      try {
        Gmail.Users.Messages.remove('me', ids[i]);
        count++;
      } catch (err) {
        Logger.log('Skipping message ' + ids[i] + ': ' + err.message);
      }
    }
    return count;
  }
}

function scheduleContinuation_() {
  ScriptApp.newTrigger(CONTINUE_HANDLER)
    .timeBased()
    .after(60 * 1000)
    .create();
}

/** Removes leftover one-off continuation triggers (keeps the daily one). */
function removeContinuationTriggers_() {
  var triggers = ScriptApp.getProjectTriggers();
  for (var i = 0; i < triggers.length; i++) {
    var t = triggers[i];
    if (t.getHandlerFunction() === CONTINUE_HANDLER &&
        t.getEventType() === ScriptApp.EventType.CLOCK &&
        !isDailyTrigger_(t)) {
      ScriptApp.deleteTrigger(t);
    }
  }
}

/**
 * One-off continuation triggers and the daily trigger look identical to
 * Apps Script, so installDailyTrigger() records the daily one's id.
 */
function isDailyTrigger_(trigger) {
  var dailyId = PropertiesService.getScriptProperties().getProperty(DAILY_ID_KEY);
  return dailyId !== null && trigger.getUniqueId() === dailyId;
}
