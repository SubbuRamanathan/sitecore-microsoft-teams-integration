using Sitecore.Configuration;
using Sitecore.Data.Items;
using Sitecore.Diagnostics;
using Sitecore.Jobs;
using Sitecore.Links;
using Sitecore.Publishing.Pipelines.Publish;
using Spe.Core.Diagnostics;
using Spe.Core.Host;
using Spe.Core.Settings;
using System;

namespace Sitecore.MicrosoftTeams.Integration.Publish
{
    public class InitiateTeamsNotification : PublishProcessor
    {
        protected readonly ProviderHelper<LinkProvider, LinkProviderCollection> providerHelper;
        private const string publishNotificationScriptID = "{B63E779E-18EC-4DE5-9F9E-DB896D8ADC0D}";

        public InitiateTeamsNotification(ProviderHelper<LinkProvider, LinkProviderCollection> providerHelper)
        {
            this.providerHelper = providerHelper;
        }

        public override void Process(PublishContext context)
        {
            Assert.ArgumentNotNull(context, "context");

            try
            {
                var options = new DefaultJobOptions("Send Teams Notification", "Notifications", Context.Site.Name, this, "Run", new object[] { context });
                JobManager.Start(options);
                PowerShellLog.Info($"Job started: Send Teams Notification");
            }
            catch (Exception ex)
            {
                PowerShellLog.Error($"Error while invoking Send Teams Notification job from Publish pipeline.", ex);
            }
        }

        public void Run(PublishContext publishContext)
        {
            Item scriptItem = Factory.GetDatabase("master").GetItem(publishNotificationScriptID);
            try
            {
                using (ScriptSession scriptSession = ScriptSessionManager.NewSession(ApplicationNames.Default, true))
                {
                    scriptSession.SetVariable("publishContext", publishContext);
                    scriptSession.ExecuteScriptPart(scriptItem, true);
                    PowerShellLog.Info($"Job ended: Send Teams Notification");
                }
            }
            catch (Exception ex)
            {
                PowerShellLog.Error($"Error while invoking {scriptItem.Paths.FullPath} script from Send Teams Notification job", ex);
            }
        }
    }
}
