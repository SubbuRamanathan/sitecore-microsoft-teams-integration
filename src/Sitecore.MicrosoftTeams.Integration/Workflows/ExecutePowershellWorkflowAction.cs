using Sitecore;
using Sitecore.Data;
using Sitecore.Data.Items;
using Sitecore.Diagnostics;
using Sitecore.Globalization;
using Sitecore.Pipelines;
using Sitecore.Text;
using Sitecore.Web.UI.Sheer;
using Sitecore.Workflows.Simple;
using Spe;
using Spe.Core.Extensions;
using Spe.Core.Settings.Authorization;
using Spe.Core.Utility;
using System;
using System.Globalization;
using System.Web.UI;

//Required to mitigate 'Workflow Approvals doesn't work in Workflow Feed Urls when the Workflow Command has a PowerShell Script Workflow Action' issue - https://github.com/SitecorePowerShell/Console/issues/1204
//Fixed in Sitecore Powershell Extensions v6.2 (Not Required if using SPE v6.2+)
namespace Sitecore.MicrosoftTeams.Integration.Workflows
{
    public class ScriptAction
    {
        public ScriptAction()
        {
        }

        public void Process(WorkflowPipelineArgs args)
        {
            Assert.ArgumentNotNull(args, "args");
            ProcessorItem processorItem = args.ProcessorItem;
            if (processorItem != null)
            {
                Item innerItem = processorItem.InnerItem;
                Item dataItem = args.DataItem;
                if (!string.IsNullOrEmpty(innerItem[Templates.ScriptWorkflowAction.Fields.ScriptBody]))
                {
                    Item item = innerItem.Database.GetItem(new ID(innerItem[Templates.ScriptWorkflowAction.Fields.ScriptBody]));
                    if (!ItemExtensions.IsPowerShellScript(item))
                    {
                        Context.ClientPage.ClientResponse.Broadcast(SessionElevationErrors.OperationFailedWrongDataTemplate(), "Shell");
                    }
                    else if ((!RulesUtils.EvaluateRules(innerItem[Templates.ScriptWorkflowAction.Fields.EnableRule], dataItem, false) ? false : RulesUtils.EvaluateRules(item[Templates.Script.Fields.ShowRule], dataItem, false)))
                    {
                        UrlString urlString = new UrlString(UIUtil.GetUri("control:PowerShellRunner"));
                        urlString.Append("id", dataItem.ID.ToString());
                        urlString.Append("db", dataItem.Database.Name);
                        urlString.Append("lang", dataItem.Language.Name);
                        int number = dataItem.Version.Number;
                        urlString.Append("ver", number.ToString(CultureInfo.InvariantCulture));
                        urlString.Append("scriptId", item.ID.ToString());
                        urlString.Append("scriptDb", item.Database.Name);
                        if (Context.ClientPage.Application == null)
                        {
                            SheerResponse.ShowModalDialog(urlString.ToString(), "400", "220");
                        }
                        else
                        {
                            Context.ClientPage.ClientResponse.Broadcast(SheerResponse.ShowModalDialog(urlString.ToString(), "400", "220", "PowerShell Script Results", false), "Shell");
                        }
                    }
                }
            }
        }
    }
}