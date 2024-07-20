{{#emailBase subject=subject site=site}}
  <tr>
    <td>
      <h5 class="title">
        {{i18n "email.base.greeting" USERNAME=username lng=locale}}
      </h5>
      <p>
        {{i18n "notification.event.canceled.mail.intro" 'You have been registered for {EVENT}. Unfortunately the event just got cancelled.' EVENT=eventTitle lng=locale}}
      </p>
      <p>
        {{i18n "notification.event.canceled.mail.personalMessage" 'The Organizer has left the following message for you:' lng=locale}}
      </p>
      <table class="comment-box">
        <tr>
          <td>
            {{{message}}}
          </td>
        </tr>
      </table>
      <table class="event">
        <tr>
          <td class="event-header">
            <a href="{{eventLink}}">
              <strong>
                {{eventDate}}
                <br />
                {{eventStart}}
                {{#if eventEnd}}
                  - {{eventEnd}}
                {{/if}}
              </strong>
              {{#if venueLine}}
                <br />
                {{venueLine}}
              {{/if}}
            </a>
          </td>
        </tr>
        <tr>
          <td class="event-gap">
          </td>
        </tr>
        <tr>
          <td class="event-canceled text-center">
            <strong>
              {{i18n 'notification.event.canceled.mail.canceled' 'This event got canceled' lng=locale}}
            </strong>
          </td>
        </tr>
        <tr>
          <td class="event-gap">
          </td>
        </tr>
        <tr>
          <td class="event-body">
            <h5 class="title">
              {{event.title}}
            </h5>
            <p>
              {{{event.description}}}
            </p>
          </td>
        </tr>
      </table>
    </td>
  </tr>
  <tr>
    <td>
      <table class="footer">
        <tr>
          <td>
            {{i18n 'notification.event.canceled.mail.notice' 'You receive this e-mail because you are involved in {EVENT}.' EVENT=eventTitle lng=locale}}
          </td>
        </tr>
        <tr>
          <td>
            <a
               href="{{unsubLink}}">{{i18n "email.base.unsubscribeLink.automatedNotifications" SITENAME=siteName lng=locale}}</a>
            &nbsp;
            <a
               href="{{urlFor 'profile' query='campaign=eventCanceled'}}">{{i18n "email.base.profileLink" lng=locale}}</a>
          </td>
        </tr>
      </table>
    </td>
  </tr>
{{/emailBase}}
