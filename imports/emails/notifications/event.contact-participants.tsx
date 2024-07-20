{{#emailBase subject=subject site=site}}
  <tr>
    <td>
      {{#if senderCopy}}
        <p>
          {{i18n "notification.event.contact-participants.mail.copyintro" 'This is a copy of the message that was sent by you.' lng=locale}}
        </p>
      {{/if}}
      <h5 class="title">
        {{i18n "email.base.greeting" USERNAME=username lng=locale}}
      </h5>
      <p>
        {{i18n "notification.event.contact-participants.mail.intro" '{SENDERNAME} sent a message to you and all attendees of the event "{EVENT}"' SENDERNAME=senderName EVENT=eventTitle lng=locale}}
      </p>
      <table class="comment-box">
        <tr>
          <td>
            {{{message}}}
          </td>
        </tr>
      </table>
      {{#if fromAddress}}
        <p class="text-center">
          <a class="button" href="{{senderLink}}">
            {{i18n "notification.event.contact-participants.mail.replyButton" 'Reply over {SITENAME}' SITENAME=siteName lng=locale}}
          </a>
        </p>
        <p class="text-center">
          {{i18n "notification.event.contact-participants.mail.direct.answerText" 'You can also send {SENDERNAME} an email directly by clicking reply in your email client' SENDERNAME=sender.getDisplayName lng=locale}}
          <br><br />
          <a class="text-center" href="mailto:{{fromAddress}}">{{fromAddress}}</a>
        </p>
      {{else}}
        <p class="text-center">
          <a class="button" href="{{senderLink}}">
            {{i18n "notification.event.contact-participants.mail.replyButton.simple" 'Reply' lng=locale}}
          </a>
        </p>
      {{/if}}
    </td>
  </tr>
  <tr>
    <td>
      <table class="footer">
        <tr>
          <td>
            <a
               href="{{unsubLink}}">{{i18n "notification.event.contact-participants.mail.unsubLink" "Unsubscribe from all private messages from users." SITENAME=siteName lng=locale}}</a>
            &nbsp;
            <a
               href="{{urlFor 'profile' query='campaign=eventContactParticipants'}}">{{i18n "email.base.profileLink" lng=locale}}</a>
          </td>
        </tr>
      </table>
    </td>
  </tr>
{{/emailBase}}
