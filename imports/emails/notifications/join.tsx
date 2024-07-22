{{#emailBase subject=subject site=site}}
  <tr>
    <td>
      <h5 class="title">
        {{i18n "email.base.greeting" USERNAME=username lng=locale}}
      </h5>
      <p>
        {{i18n "notification.join.mail.intro" '{USERNAME} just joined {COURSE} as: {ROLE}.' USERNAME=newParticipant COURSE=course ROLE=roleTitle ROLETYPE=roleType lng=locale}}
      </p>
      {{#if message}}
        <p>
          {{i18n "notification.join.mail.message" 'They left this message:' lng=locale}}
        </p>
        <table class="comment-box">
          <tr>
            <td>
              {{{message}}}
            </td>
          </tr>
        </table>
      {{/if}}
      {{#if appendCollaborationHint}}
        <p>
          {{i18n "notification.join.mail.collaborationHint" 'If you like them to collaborate feel free to make contact. Give out rights to edit {COURSE} by adding people to its organization team by clicking the bullhorn next to a name.' COURSE=course lng=locale}}
        </p>
      {{/if}}
      <strong>{{i18n "notification.join.mail.statsOverview" 'Overview over participants:' lng=locale}}</strong>
      <p>
        {{#each figure in figures}}
          {{figure.role}}: {{figure.count}}<br />
        {{/each}}
      </p>
    </td>
  </tr>
  <tr>
    <td>
      <table class="footer">
        <tr>
          <td>
            {{i18n "email.base.receiveNote.courseTeam" COURSE=course lng=locale}}
          </td>
        </tr>
        <tr>
          <td>
            {{i18n "email.base.receiveNote.otherRecipients" OTHERRECIPIENTS=otherRecipients lng=locale}}
          </td>
        </tr>
        <tr>
          <td>
            <a
               href="{{unsubLink}}">{{i18n "email.base.unsubscribeLink.automatedNotifications" SITENAME=siteName lng=locale}}</a>
            &nbsp;
            <a
               href="{{urlFor 'profile' query='campaign=joinNotify'}}">{{i18n "email.base.profileLink" lng=locale}}</a>
          </td>
        </tr>
        <tr>
          <td style="padding-top: 16px;">
            {{i18n "email.base.spamPrevention" MAIL=email lng=locale}}
          </td>
        </tr>
      </table>
    </td>
  </tr>
{{/emailBase}}
